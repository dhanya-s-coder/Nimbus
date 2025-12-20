import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS, fetchWithAuth } from "../../../api/config";
import { useHistory } from "../../../context/HistoryContext";
import { toast } from "../../../utils/toast";
import Header from "../../common/Header";
import "./EmailDraft.css";

export default function EmailDraft() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { historyItems, refreshHistory } = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.emailData) {
      loadDraft(location.state.emailData);
    }
  }, [location.state]);

  // Get recent emails only
  const recentEmails = historyItems.filter(item => item.type === 'email').slice(0, 3);

  const [subject, setSubject] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const editorRef = useRef(null);

  // Streaming state
  const [isGenerating, setIsGenerating] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast.warning("Please enter a prompt first.");
      return;
    }

    // Reset state
    setDraft("");
    setIsGenerating(true);
    if (editorRef.current) editorRef.current.innerText = "";

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.EMAIL.GENERATE, {
        method: "POST",
        body: JSON.stringify({ subject, prompt }),
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();

      if (data.emailBody) {
        streamText(data.emailBody);
      } else {
        setDraft("Error generating email.");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setDraft("Failed to generate email");
      setIsGenerating(false);
    }
  };

  const streamText = (fullText) => {
    let index = -1;
    setDraft(""); // Clear initial
    if (editorRef.current) editorRef.current.innerText = "";

    const interval = setInterval(() => {
      index++;
      if (index < fullText.length) {
        setDraft((prev) => prev + fullText.charAt(index));
        // Also update contentEditable div directly for smoother visual if needed, 
        // though React state should handle it. Updating DOM directly prevents cursor jumping if user tries to select.
        if (editorRef.current) {
          editorRef.current.innerText += fullText.charAt(index);
        }
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 20);
  };

  const handleSend = async () => {
    // Sync editor content before sending
    let finalContent = draft;
    if (editorRef.current) {
      finalContent = editorRef.current.innerText;
      setDraft(finalContent);
    }

    if (!subject || !finalContent) {
      toast.warning("Please fill in subject and generate email content first.");
      return;
    }
    if (!recipientEmail) {
      toast.warning("Please enter a recipient email address.");
      return;
    }
    if (!isValidEmail(recipientEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.EMAIL.SEND, {
        method: "POST",
        body: JSON.stringify({
          recipient: recipientEmail,
          subject,
          content: finalContent,
          prompt
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Email sent successfully!");

        // Refresh history to show the sent email
        if (refreshHistory) {
          refreshHistory();
        }

        // Clear the form
        setSubject("");
        setRecipientEmail("");
        setPrompt("");
        setDraft("");
        if (editorRef.current) editorRef.current.innerText = "";
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send email.");
      }
    } catch (error) {
      toast.error("An error occurred while sending.");
    }
  };

  const handleUpdateDraft = () => {
    if (editorRef.current) {
      setDraft(editorRef.current.innerText);
      toast.success("Draft content updated!");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveDraft = async () => {
    // Sync editor content before saving if manual edits were made
    let finalContent = draft;
    if (editorRef.current) {
      finalContent = editorRef.current.innerText;
      setDraft(finalContent);
    }

    if (!subject) {
      toast.warning("Please enter a subject to save the draft.");
      return;
    }

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.EMAIL.SAVE, {
        method: "POST",
        body: JSON.stringify({
          subject,
          content: finalContent,
          prompt,
          recipient: recipientEmail
        }),
      });

      if (response.ok) {
        toast.success("Draft saved to history!");
        // Refresh history to show the draft
        if (refreshHistory) {
          refreshHistory();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save draft.");
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
    }
  };

  const loadDraft = (item) => {
    setSubject(item.subject || "");
    setPrompt(item.rawPrompt || "");
    setDraft(item.content || "");
    setRecipientEmail(item.recipient || "");
    if (editorRef.current) {
      editorRef.current.innerText = item.content || "";
    }
    toast.info("Draft loaded successfully");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="email-page">

      <Header title="Email Generator" />

      {/* MAIN AREA */}
      <main className="main">

        <h3 className="page-title">Compose New Email</h3>

        {/* FORM CARD */}
        <div className="card form-card">

          <label>Subject</label>
          <input
            className="input"
            placeholder="Enter subject…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label>Recipient Email</label>
          <input
            className="input"
            placeholder="Enter recipient email… (required to send)"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />

          <label>Describe what the email should say (Prompt)</label>
          <textarea
            className="textarea"
            placeholder='Example: "Announce seminar on AI ethics, formal tone…"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

        </div>

        <button className="generate-btn" onClick={handleGenerate}>
          Generate Email
        </button>

        <h3 className="draft-title">AI Draft</h3>

        {/* DRAFT PREVIEW */}
        <div className="card draft-card">
          <p className="placeholder">
            {draft ? "" : "The generated email will appear here… (editable)"}
          </p>

          <div
            className="draft-editor"
            contentEditable
            ref={editorRef}
            suppressContentEditableWarning
          >
            {draft}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-row">
          <button className="btn" onClick={handleUpdateDraft} style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>Confirm Edits</button>
          <button className="btn primary" onClick={handleSend}>Send Email</button>
          <button className="btn" onClick={handleDownload}>Download</button>
          <button className="btn" onClick={handleSaveDraft}>Save Draft</button>
        </div>

      </main>

      {/* RIGHT PANEL */}
      <aside className="right-panel">

        <h3 className="rp-title">Recent Drafts</h3>

        {recentEmails.length > 0 ? (
          recentEmails.map(item => (
            <div key={item.id} className="card small-card" onClick={() => loadDraft(item)}>
              <div className="item-title">{item.subject || 'Untitled'}</div>
              <div className="item-sub">{item.status || 'Draft'}</div>
            </div>
          ))
        ) : (
          <div className="card small-card" style={{ cursor: 'default' }}>
            <div className="item-sub">No recent drafts</div>
          </div>
        )}

      </aside>
    </div>
  );
}

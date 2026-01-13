import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS, fetchWithAuth } from "../../api/config";
import { useHistory } from "../../context/HistoryContext";
import { toast } from "../../utils/toast";
import "./tools.css";
import RecentActivity from "../common/RecentActivity";
import { FiMail, FiClock } from "react-icons/fi";
import "../dashboard/dashboard.css"

export default function EmailGenerator() {
    const { refreshHistory } = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.emailData) {
            loadDraft(location.state.emailData);
        }
    }, [location.state]);

    const loadDraft = (item) => {
    setSubject(item.subject || "");
    setPrompt(item.rawPrompt || "");
    setDraft(item.content || "");
    setRecipientEmail(item.recipient || "");
    if (editorRef.current) {
        editorRef.current.innerText = item.content || "";
    }
    toast.success("Email loaded successfully");
    };

    const [subject, setSubject] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [prompt, setPrompt] = useState("");
    const [draft, setDraft] = useState("");
    const editorRef = useRef(null);

    const [isGenerating, setIsGenerating] = useState(false);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleGenerate = async () => {
        if (!subject.trim()) {
            toast.warning("Please enter an email subject.");
            return;
        }
        if (!prompt.trim()) {
            toast.warning("Please enter context/prompt for the email.");
            return;
        }

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

            if (data.success && data.data?.emailBody) {
                streamText(data.data.emailBody);
            } else {
                setDraft(data.message || "Error generating email.");
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
        setDraft("");
        if (editorRef.current) editorRef.current.innerText = "";

        const interval = setInterval(() => {
            index++;
            if (index < fullText.length) {
                setDraft((prev) => prev + fullText.charAt(index));
            } else {
                clearInterval(interval);
                setIsGenerating(false);
            }
        }, 20);
    };

    const handleSend = async () => {
        let finalContent = draft;
        if (editorRef.current) {
            finalContent = editorRef.current.innerText;
            setDraft(finalContent);
        }

        if (!subject.trim()) {
            toast.warning("Please enter a subject.");
            return;
        }
        if (!draft.trim()) {
            toast.warning("Please generate or enter email content.");
            return;
        }
        if (!recipientEmail.trim()) {
            toast.warning("Please enter recipient email address.");
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
                refreshHistory();
                setSubject("");
                setRecipientEmail("");
                setPrompt("");
                setDraft("");
                if (editorRef.current) editorRef.current.innerText = "";
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to send email.");
            }
        } catch (error) {
            toast.error("An error occurred while sending.");
        }
    };


    const handleDownload = () => {
        const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Email: ${subject || 'Untitled'}(By Nimbus).txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveDraft = async () => {
        if (!subject.trim()) {
            toast.warning("Please enter a subject.");
            return;
        }
        if (!draft.trim()) {
            toast.warning("Please generate or enter email content.");
            return;
        }
        let finalContent = draft;
        if (editorRef.current) {
            finalContent = editorRef.current.innerText;
            setDraft(finalContent);
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
                const data = await response.json();
                toast.success(data.message || "Draft saved to history!");
                refreshHistory();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to save draft.");
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        }
    };

    return (
        <div className="tool-page">
            <div className="tool-container">
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Compose Email</h2>
                            <p className="tool-subtitle">Define recipient and prompt to spark the AI</p>
                        </header>

                        <div className="tool-form">
                            <div className="tool-form-group">
                                <label>Recipient Email</label>
                                <input
                                    type="email"
                                    placeholder="e.g. nimbus00agam@gmail.com"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                />
                            </div>

                            <div className="tool-form-group">
                                <label>Subject Line</label>
                                <input
                                    type="text"
                                    placeholder="Enter a descriptive subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="tool-form-group">
                                <label>Email message</label>
                                <textarea
                                    placeholder='Describe what the email should be about...'
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={6}
                                />
                            </div>

                            <div className="tool-actions">
                                <button
                                    className="tool-btn-generate"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <span className="loading-dots">Generating<span>.</span><span>.</span><span>.</span></span>
                                    ) : (
                                        <>✨ Generate Email</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="tool-footer-history">
                            <RecentActivity filterType="Emails" limit={3} title="Recent Emails" />
                        </div>
                    </div>
                </div>

                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">AI Draft Preview</h2>
                            {draft && <span className="premium-badge">Editable</span>}
                        </header>

                        <div className="tool-preview-container">
                            <div
                                className="tool-preview-editor"
                                contentEditable={true}
                                ref={editorRef}
                                suppressContentEditableWarning
                            >
                                {draft}
                            </div>
                            {!draft && !isGenerating && (
                                <div className="tool-preview-placeholder">
                                    <div className="empty-icon-lg">📧</div>
                                    <p>Spark the AI to see your draft here</p>
                                </div>
                            )}
                        </div>

                        <div className="tool-preview-actions">
                            <button className="tool-btn-secondary" onClick={handleSaveDraft}>
                                <FiClock /> <span>Save Draft</span>
                            </button>
                            <button className="tool-btn-secondary" onClick={handleDownload}>
                                <FiMail style={{ transform: 'rotate(-45deg)' }} /> <span>Download</span>
                            </button>
                            <button className="tool-btn-final" onClick={handleSend}>
                                <span>Send Email Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

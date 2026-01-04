import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS, fetchWithAuth } from "../../api/config";
import { useHistory } from "../../context/HistoryContext";
import { toast } from "../../utils/toast";
import "./tools.css";
import RecentActivity from "../common/RecentActivity";
import { FiFileText, FiSave } from "react-icons/fi";

export default function ReportGenerator() {
    const { refreshHistory } = useHistory();
    const location = useLocation();

    const [reportType, setReportType] = useState("Meeting Minutes");
    const [title, setTitle] = useState("");
    const [rawInput, setRawInput] = useState("");
    const [reportContent, setReportContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        if (location.state && location.state.Data) {
            loadReport(location.state.Data);
        }
    }, [location.state]);

    const reportTypes = [
        "Meeting Minutes",
        "Event Summary",
        "Monthly Progress",
        "Project Proposal",
        "Academic Report",
        "Other"
    ];

    const handleGenerate = async () => {
        if (!title.trim()) {
            toast.warning("Please enter a report title.");
            return;
        }
        if (!rawInput.trim()) {
            toast.warning("Please enter raw notes or input for the report.");
            return;
        }

        setReportContent("");
        setIsGenerating(true);
        if (editorRef.current) editorRef.current.innerText = "";

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.REPORT.GENERATE, {
                method: "POST",
                body: JSON.stringify({ reportType, title, rawInput }),
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data?.content) {
                streamText(data.data.content);
                toast.success(data.message || "Report generated!");
            } else {
                setReportContent(data.message || "Error generating report.");
                setIsGenerating(false);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to generate report");
            setIsGenerating(false);
        }
    };

    const streamText = (fullText) => {
        let index = -1;
        setReportContent("");
        if (editorRef.current) editorRef.current.innerText = "";

        const interval = setInterval(() => {
            index++;
            if (index < fullText.length) {
                const char = fullText.charAt(index);
                setReportContent((prev) => prev + char);
                if (editorRef.current) {
                    editorRef.current.innerText = (editorRef.current.innerText || "") + char;
                }
            } else {
                clearInterval(interval);
                setIsGenerating(false);
            }
        }, 10);
    };

    const handleSave = async (status = 'final') => {
        const finalContent = editorRef.current ? editorRef.current.innerText : reportContent;

        if (!title.trim()) {
            toast.warning("Please enter a title.");
            return;
        }
        if (!finalContent.trim()) {
            toast.warning("Please generate or enter report content.");
            return;
        }

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.REPORT.SAVE, {
                method: "POST",
                body: JSON.stringify({
                    reportType,
                    title,
                    rawInput,
                    content: finalContent,
                    status
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || (status === 'final' ? "Report saved to history!" : "Draft saved!"));
                refreshHistory();
            } else {
                toast.error(data.message || "Failed to save report.");
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        }
    };

    const handleDownload = () => {
        const finalContent = editorRef.current ? editorRef.current.innerText : reportContent;
        if (!finalContent) {
            toast.warning("Nothing to download");
            return;
        }
        const blob = new Blob([finalContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Report: ${title || 'Untitled'}(By Nimbus).txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const loadReport = (item) => {
        setReportType(item.reportType || "Meeting Minutes");
        setTitle(item.title || "");
        setRawInput(item.rawInput || "");
        setReportContent(item.content || "");
        if (editorRef.current) {
            editorRef.current.innerText = item.content || "";
        }
        toast.info("Report loaded successfully");
    };

    return (
        <div className="tool-page">
            <div className="tool-container">
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Prepare Report</h2>
                            <p className="tool-subtitle">Select type and provide raw notes to generate</p>
                        </header>

                        <div className="tool-form">
                            <div className="tool-form-group">
                                <label>Report Type</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    {reportTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="tool-form-group">
                                <label>Report Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Faculty Meeting - Dec 2025"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="tool-form-group">
                                <label>Raw Notes / Input</label>
                                <textarea
                                    placeholder='Paste your rough notes, bullet points, or meeting transcript here...'
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
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
                                        <>✨ Generate Report</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="tool-footer-history">
                            <RecentActivity filterType="Reports" limit={3} title="Recent Reports" />
                        </div>
                    </div>
                </div>

                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">Generated Report</h2>
                            {reportContent && <span className="premium-badge">Editable</span>}
                        </header>

                        <div className="tool-preview-container">
                            <div
                                className="tool-preview-editor"
                                contentEditable={true}
                                ref={editorRef}
                                suppressContentEditableWarning
                            >
                            </div>
                            {!reportContent && !isGenerating && (
                                <div className="tool-preview-placeholder">
                                    <div className="empty-icon-lg">📊</div>
                                    <p>Generate a report to see the magic here</p>
                                </div>
                            )}
                        </div>

                        <div className="tool-preview-actions">
                            <button className="tool-btn-secondary" onClick={() => handleSave('draft')}>
                                <FiFileText /> <span>Save Draft</span>
                            </button>
                            <button className="tool-btn-secondary" onClick={() => handleSave('final')}>
                                <FiSave /> <span>Finalize</span>
                            </button>
                            <button className="tool-btn-final" onClick={handleDownload}>
                                <span>Download as PDF (Print)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS, fetchWithAuth } from "../../api/config";
import { useHistory } from "../../context/HistoryContext";
import { toast } from "../../utils/toast";
import "./tools.css";
import "./report-latex.css";
import RecentActivity from "../common/RecentActivity";
import { FiFileText, FiSave, FiRefreshCw, FiDownload } from "react-icons/fi";

const REPORT_TYPES = ["Meeting Minutes", "Event Summary", "Monthly Progress", "Project Proposal", "Academic Report", "Other"];
const AUTO_COMPILE_DELAY = 1800;

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export default function ReportGenerator() {
    const { refreshHistory } = useHistory();
    const location = useLocation();

    const [reportType, setReportType] = useState("Meeting Minutes");
    const [title, setTitle] = useState("");
    const [rawInput, setRawInput] = useState("");
    const [sources, setSources] = useState([]);

    const [latex, setLatex] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [pdfBlob, setPdfBlob] = useState(null);
    const [compileState, setCompileState] = useState("idle"); // idle | compiling | ok | error
    const [compileError, setCompileError] = useState(null);   // { message, log }
    const [isGenerating, setIsGenerating] = useState(false);
    const [autoCompile, setAutoCompile] = useState(true);

    const compileSeq = useRef(0);
    const lastCompiled = useRef("");
    const urlRef = useRef("");

    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    /** Compile `source` on the server (Tectonic) and show the PDF. Stale responses are ignored. */
    const compile = useCallback(async (source) => {
        if (!source.trim()) return;
        const seq = ++compileSeq.current;
        setCompileState("compiling");
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.REPORT.COMPILE, { method: "POST", body: JSON.stringify({ latex: source }) });
            if (seq !== compileSeq.current) return;
            if (res.ok && (res.headers.get("content-type") || "").includes("application/pdf")) {
                const blob = await res.blob();
                if (seq !== compileSeq.current) return;
                if (urlRef.current) URL.revokeObjectURL(urlRef.current);
                urlRef.current = URL.createObjectURL(blob);
                lastCompiled.current = source;
                setPdfBlob(blob);
                setPdfUrl(urlRef.current);
                setCompileError(null);
                setCompileState("ok");
            } else {
                const data = await res.json().catch(() => ({}));
                lastCompiled.current = source;
                setCompileError({ message: data.message || `Compile failed (HTTP ${res.status})`, log: data.log || "" });
                setCompileState("error");
            }
        } catch (err) {
            if (seq !== compileSeq.current) return;
            setCompileError({ message: err.message || "Could not reach the server", log: "" });
            setCompileState("error");
        }
    }, []);

    // recompile automatically shortly after the user stops typing in the source editor
    useEffect(() => {
        if (!autoCompile || !latex || latex === lastCompiled.current || isGenerating) return undefined;
        const t = setTimeout(() => compile(latex), AUTO_COMPILE_DELAY);
        return () => clearTimeout(t);
    }, [latex, autoCompile, isGenerating, compile]);

    useEffect(() => {
        const item = location.state?.Data;
        if (!item) return;
        setReportType(item.reportType || "Meeting Minutes");
        setTitle(item.rawTitle || item.title || "");
        setRawInput(item.rawInput || "");
        if (item.format === "latex" && item.content) {
            setLatex(item.content);
            compile(item.content);
            toast.success("Report loaded");
        } else {
            // older reports were plain text: reuse their text as notes so a LaTeX version can be generated
            setLatex("");
            setPdfUrl("");
            setRawInput(item.rawInput || item.content || "");
            toast.info("This is an older text report. Click Generate to create the LaTeX version.");
        }
    }, [location.state, compile]);

    const handleGenerate = async () => {
        if (!title.trim()) return toast.warning("Please enter a report title.");
        if (!rawInput.trim()) return toast.warning("Please enter your notes or data for the report.");

        setIsGenerating(true);
        setSources([]);
        setCompileError(null);
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.REPORT.GENERATE_LATEX, { method: "POST", body: JSON.stringify({ reportType, title, rawInput }) });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || data.message || `HTTP ${res.status}`);
            setSources(data.data.sources || []);
            setLatex(data.data.latex);
            await compile(data.data.latex);
            toast.success("Report ready");
        } catch (err) {
            toast.error(err.message || "Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (status = "final") => {
        if (!title.trim()) return toast.warning("Please enter a title.");
        if (!latex.trim()) return toast.warning("Generate a report first.");
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.REPORT.SAVE, {
                method: "POST",
                body: JSON.stringify({ reportType, title, rawInput, content: latex, format: "latex", status }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(status === "final" ? "Report saved to history!" : "Draft saved!");
                refreshHistory();
            } else {
                toast.error(data.message || "Failed to save report.");
            }
        } catch {
            toast.error("An error occurred while saving.");
        }
    };

    const safeName = (title || "Report").replace(/[^\w\- ]+/g, "").trim() || "Report";
    const downloadPdf = async () => {
        if (compileState === "compiling") return toast.info("Compiling… try again in a moment.");
        if (!pdfBlob || lastCompiled.current !== latex || compileState === "error") {
            await compile(latex);
            return toast.info("Recompiled — click Download PDF again.");
        }
        downloadBlob(pdfBlob, `${safeName} (By Nimbus).pdf`);
    };
    const downloadTex = () => {
        if (!latex.trim()) return toast.warning("Nothing to download");
        downloadBlob(new Blob([latex], { type: "application/x-tex;charset=utf-8" }), `${safeName}.tex`);
    };

    const statusBadge = {
        idle: null,
        compiling: <span className="rl-badge busy">⏳ Compiling…</span>,
        ok: <span className="rl-badge ok">✓ PDF ready</span>,
        error: <span className="rl-badge bad">⚠ Compile error</span>,
    }[compileState];

    return (
        <div className="tool-page">
            <div className="tool-container">
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Prepare Report</h2>
                            <p className="tool-subtitle">Give your notes or data — Nimbus writes a LaTeX report and compiles it to PDF</p>
                        </header>

                        <div className="tool-form">
                            <div className="tool-form-group">
                                <label>Report Type</label>
                                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                    {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="tool-form-group">
                                <label>Report Title</label>
                                <input type="text" placeholder="e.g. Faculty Meeting - Dec 2025" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>

                            <div className="tool-form-group">
                                <label>Notes / Data</label>
                                <textarea
                                    placeholder="Paste rough notes, numbers, bullet points or a transcript. Facts from your Knowledge Base are added automatically."
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
                                    rows={8}
                                />
                            </div>

                            <div className="tool-actions">
                                <button className="tool-btn-generate" onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <span className="loading-dots">Writing report<span>.</span><span>.</span><span>.</span></span> : <>✨ Generate Report</>}
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
                            {statusBadge}
                        </header>

                        <div className="rl-preview">
                            {pdfUrl ? (
                                <iframe title="Report preview" src={`${pdfUrl}#view=FitH`} className={`rl-frame ${compileState === "compiling" ? "dim" : ""}`} />
                            ) : (
                                <div className="tool-preview-placeholder">
                                    <div className="empty-icon-lg">📄</div>
                                    <p>{isGenerating ? "Writing your report…" : "Your report preview will appear here"}</p>
                                </div>
                            )}
                        </div>

                        {compileState === "error" && compileError && (
                            <div className="rl-error" role="alert">
                                <strong>{compileError.message}</strong>
                                {compileError.log && <pre>{compileError.log}</pre>}
                                <small>The preview above shows the last version that compiled. Fix the LaTeX below and it will recompile.</small>
                            </div>
                        )}

                        {sources.length > 0 && (
                            <p className="rl-sources">🧠 Sources used: {sources.map((s) => s.title).join(", ")}</p>
                        )}

                        <div className="rl-actions">
                            <button className="tool-btn-secondary" onClick={() => compile(latex)} disabled={!latex || compileState === "compiling"}>
                                <FiRefreshCw /> <span>Recompile</span>
                            </button>
                            <button className="tool-btn-final" onClick={downloadPdf} disabled={!latex}>
                                <FiDownload /> <span>Download PDF</span>
                            </button>
                            <button className="tool-btn-secondary" onClick={downloadTex} disabled={!latex}>
                                <span>Download .tex</span>
                            </button>
                            <button className="tool-btn-secondary" onClick={() => handleSave("draft")} disabled={!latex}>
                                <FiFileText /> <span>Save Draft</span>
                            </button>
                            <button className="tool-btn-secondary" onClick={() => handleSave("final")} disabled={!latex}>
                                <FiSave /> <span>Finalize</span>
                            </button>
                        </div>

                        <section className="rl-source">
                            <div className="rl-source-head">
                                <h3>LaTeX source <small>editable</small></h3>
                                <label className="rl-auto">
                                    <input type="checkbox" checked={autoCompile} onChange={(e) => setAutoCompile(e.target.checked)} />
                                    Auto-compile after typing
                                </label>
                            </div>
                            <textarea
                                className="rl-editor"
                                spellCheck={false}
                                value={latex}
                                placeholder="The generated LaTeX appears here. Edit it freely, then click Recompile (or Ctrl+Enter)."
                                onChange={(e) => setLatex(e.target.value)}
                                onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); compile(latex); } }}
                                rows={24}
                            />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

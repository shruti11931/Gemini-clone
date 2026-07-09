import React from 'react'
import './PdfPreview.css'

const PdfPreview = ({ fileName, onRemove }) => {
    if (!fileName) return null

    return (
        <div className="pdf-preview-container">
            <div className="pdf-preview-wrapper">
                <span className="pdf-icon">📄</span>
                <span className="pdf-filename" title={fileName}>{fileName}</span>
                <button onClick={onRemove} className="pdf-remove-btn" title="Remove PDF">✕</button>
            </div>
            <p className="pdf-preview-label">PDF ready to send</p>
        </div>
    )
}

export default PdfPreview
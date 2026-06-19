import React, { useContext, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import Conversation from '../Conversation/Conversation'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'


const formatHistory = (text) => {
  text = text.replace(
    /\|(.+)\|\n\|[-| :\t]+\|\n((?:\|.+\|\n?)+)/g,
    (_, header, body) => {
      const headers = header.split('|').map(h => h.trim()).filter(Boolean);
      const rows = body.trim().split('\n').map(row =>
        row.split('|').map(c => c.trim()).filter(Boolean)
      );
      const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
      const tbody = rows.map(r =>
        `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`
      ).join('');
      return `<table class="ai-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
    }
  );
  text = text.replace(/^\|[-| :\t]+\|$/gm, '');
  text = text.replace(/^\|(.+)\|$/gm, (_, row) =>
    row.split('|').map(c => c.trim()).filter(Boolean).join(' · ')
  );
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br/>');
};

const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}


const Main = () => {
  const {
    onSent, recentPrompt, showResult,
    loading, resultData, input, setInput,
    uploadedImage, setUploadedImage,
    imagePreview, setImagePreview,
    sentImagePreview,
    chatHistory,
    isGenerating, stopGenerating,   // ← ADD
    regenerateResponse,           
     user,        // ← ADD
    editAndResend,                   // ← ADD

  } = useContext(Context)

  const iconBtn = {
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '16px',
    opacity: 0.7, padding: '4px 6px',
    borderRadius: '6px',
    transition: 'opacity 0.2s'
  }

  // ✅ Hidden file input ref
  const fileInputRef = useRef(null)
  const sentImageRef = useRef(null)

  const [feedback, setFeedbackLocal] = useState(null)
  const [copied, setCopied] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [editText, setEditText] = useState("") // 'up' | 'down' | null

  const { transcript, listening, resetTranscript,
    browserSupportsSpeechRecognition } = useSpeechRecognition()

  React.useEffect(() => {
    if (transcript) setInput(transcript)
  }, [transcript])

  // ✅ Convert image to base64 and store
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Only allow images
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64Full = reader.result          // data:image/png;base64,XXX
      const base64Data = base64Full.split(',')[1] // just the XXX part

      setUploadedImage(base64Data)   // send this to backend
      setImagePreview(base64Full)    // show this in UI
    }
    reader.readAsDataURL(file)

    // Reset file input so same file can be re-selected
    e.target.value = ''
  }

  React.useEffect(() => {
    setFeedbackLocal(null)
  }, [resultData])

  const handleMic = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Browser does not support speech recognition.')
      return
    }
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      setInput('')
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      SpeechRecognition.stopListening()
      onSent()
    }
  }

  // ✅ Remove image preview
  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
  }

  const handleCopy = () => {
    const plain = resultData.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='main'>
      <div className="nav">
        <p>Gemini</p>
        <div className="nav-avatar">{getInitials(user?.name)}</div>
      </div>

      <div className={`main-container ${!showResult ? 'home' : ''}`}>
        {!showResult ? (
          <>
            <div className="greet">
              <p><span>Hello, Dev.</span></p>
              <p>How can I help you today?</p>
            </div>
            <div className="cards">
              <div className="card" onClick={() => onSent("Suggest beautiful places to see on an upcoming road trip")}>
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="" />
              </div>
              <div className="card" onClick={() => onSent("Briefly summarize this concept: urban planning")}>
                <p>Briefly summarize this concept: urban planning</p>
                <img src={assets.bulb_icon} alt="" />
              </div>
              <div className="card" onClick={() => onSent("Brainstorm team bonding activities for our work retreat")}>
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="" />
              </div>
              <div className="card" onClick={() => onSent("Improve the readability of the following code")}>
                <p>Improve the readability of the following code</p>
                <img src={assets.code_icon} alt="" />
              </div>
            </div>
          </>
        ) : (
       
            <Conversation />

        )}

        <div className="main-bottom">

          {/* ✅ Image preview above search box */}
          {imagePreview && (
            <div className="image-preview-container">
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="preview" className="image-preview" />
                <button onClick={removeImage} className="image-remove-btn">✕</button>
              </div>
              <p className="image-preview-label">Image ready to send</p>
            </div>
          )}
          {isGenerating && (
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <button onClick={stopGenerating} style={{
                padding: '6px 16px', borderRadius: '20px',
                border: '1px solid #aaa', background: 'none',
                cursor: 'pointer', fontSize: '13px'
              }}>
                ⏹ Stop generating
              </button>
            </div>
          )}

          <div className={`search-box ${listening ? 'listening' : ''} ${imagePreview ? 'has-image' : ''}`}>
            <input
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              value={input}
              type='text'
              placeholder={
                listening ? 'Listening...' :
                  imagePreview ? 'Ask something about this image...' :
                    'Enter a prompt here'
              }
            />
            <div>
              {/* ✅ Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {/* ✅ Gallery icon triggers file input */}

              <img
                src={assets.img}
                alt="upload image"
                onClick={() => fileInputRef.current.click()}
                style={{
                  cursor: 'pointer',
                  opacity: imagePreview ? 1 : 0.5,
                  filter: imagePreview ? 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(180deg)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                title="Upload an image"
              />
              <img
                src={assets.mic_icon}
                alt="mic"
                onClick={handleMic}
                className={listening ? 'mic-active' : ''}
                style={{ cursor: 'pointer' }}
              />
              {(input || imagePreview) && !listening ? (
                <img
                  onClick={() => onSent()}
                  src={assets.send_icon}
                  alt="send"
                  style={{ cursor: 'pointer' }}
                />
              ) : null}
            </div>
          </div>
          <p className='bottom-info'>
            Gemini may display inaccurate info, so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Main
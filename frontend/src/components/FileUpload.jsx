/**
 * FileUpload — Drag-and-drop file upload component.
 */

import { useState, useRef } from 'react';
import { Upload, X, Image, Video } from 'lucide-react';

export default function FileUpload({ onFileSelect, accept = 'image/*,video/*', label, currentFile }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(currentFile || null);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file) => {
    onFileSelect(file);
    if (file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
    }
  };

  const clearFile = () => {
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (preview) {
    return (
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--gray-200)',
        overflow: 'hidden',
      }}>
        {typeof preview === 'string' && preview.startsWith('data:image') ? (
          <img src={preview} alt="Preview" style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
          }} />
        ) : typeof preview === 'string' && preview.startsWith('http') ? (
          <img src={preview} alt="Preview" style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
          }} />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            background: 'var(--gray-50)',
            gap: 8,
            color: 'var(--gray-600)',
          }}>
            <Video size={24} />
            <span>{typeof preview === 'string' ? preview : 'Video selected'}</span>
          </div>
        )}
        <button
          onClick={clearFile}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`file-upload ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files[0]) handleFile(e.target.files[0]);
        }}
        style={{ display: 'none' }}
      />
      <div className="file-upload-icon">
        <Upload size={32} />
      </div>
      <p className="file-upload-text">
        <span>Click to upload</span> or drag and drop
      </p>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
        {label || 'PNG, JPG, GIF, MP4 up to 10MB'}
      </p>
    </div>
  );
}

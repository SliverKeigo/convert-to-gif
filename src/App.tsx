import React, {useState} from 'react';
import {useDropzone} from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import {createGIF} from './gifEncoder';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import './index.css';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<string[]>([]);
  const [hasAddedFiles, setHasAddedFiles] = useState(false);
  let [progress, setProgress] = useState(0);
  const {getRootProps, getInputProps} = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setHasAddedFiles(true);
    },
  });

  const handleConvert = async () => {
    const convertedFiles: string[] = [];
    const totalProgress = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
      });
      const convertedFile = await createGIF(compressedFile);
      convertedFiles.push(convertedFile);

      const currentProgress = Math.min(Math.ceil((i + 1) / totalProgress * 100), 100);
      setProgress(currentProgress);

    }
    setConvertedFiles(convertedFiles);
  };

  const handleDownload = () => {
    setProgress(0);
    const zip = new JSZip();
    for (const file  of convertedFiles) {
      const uniqueId = Math.random().toString(36).substring(2, 7);
      zip.file(`${uniqueId}.gif`, file.split(',')[1], {base64: true});
    }
    zip.generateAsync({type: 'blob'}).then((content) => {
      saveAs(content, 'converted_files.zip');
    });
    setConvertedFiles([]);
    setFiles([])
  };

  return (
    <div className="app-container">
      <div {...getRootProps()} className={`dropzone ${hasAddedFiles ? 'has-files' : ''}`}>
        <input {...getInputProps()} />
        {hasAddedFiles ? (
          <p>已添加 {files.length} 个文件</p>
        ) : (
          <p>Drag and drop files here, or click to select files</p>
        )}
      </div>
      {
        progress !== 0 ? (
            <button onClick={handleDownload}
                    className="download-button">
              {(progress !== 100 || (convertedFiles.length !== files.length)) ? (
                <div className="progress-bar">
                  Converting {progress}%
                </div>
              ) : "Download Converted Files"}

            </button>)
          : (<button onClick={handleConvert}
                   className="convert-button">
                Convert to GIF
      </button>)
      }

    </div>
  );
};

export default App


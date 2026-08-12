"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile() {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const loadingToast = toast.loading("Uploading document...");

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("tags", tags);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success(
          result.message || "Document uploaded successfully!"
        );

        setMessage("✅ File uploaded successfully!");

        setFile(null);
        setTags("");

        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else {
        toast.error(result.message || "Upload failed.");
        setMessage("❌ Upload failed.");
      }
    } catch (error) {
      console.error(error);

      toast.dismiss(loadingToast);

      toast.error("Upload failed.");

      setMessage("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Upload Documents
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">

        <label
          htmlFor="fileUpload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();

            if (e.dataTransfer.files.length) {
              setFile(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-blue-400 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition"
        >
          <p className="text-2xl">📁</p>

          <p className="text-lg font-semibold">
            Drag & Drop your file here
          </p>

          <p className="text-gray-500 mt-2">
            or click to browse
          </p>

          <input
            ref={inputRef}
            id="fileUpload"
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>

        {file && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="font-bold mb-2">
              Selected File
            </h3>

            <p>
              <strong>Name:</strong> {file.name}
            </p>

            <p>
              <strong>Size:</strong>{" "}
              {(file.size / 1024).toFixed(2)} KB
            </p>

            <p>
              <strong>Type:</strong> {file.type}
            </p>
          </div>
        )}

        {/* Tags Input */}

        <div className="mt-6">
          <label
  htmlFor="fileUpload"
  onClick={() => inputRef.current?.click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      setFile(e.dataTransfer.files[0]);
      if (inputRef.current) {
  inputRef.current.files = e.dataTransfer.files;
}
    }
  }}
  className="border-2 border-dashed border-blue-400 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition"
>
          </label>

          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="AI, Resume, Research..."
            className="w-full border rounded-lg px-4 py-3"
          />

          <p className="text-sm text-gray-500 mt-2">
            Separate multiple tags using commas.
          </p>
        </div>

        <button
          onClick={uploadFile}
          disabled={loading}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>

        {message && (
          <p
            className={`mt-4 font-semibold ${
              message.startsWith("✅")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
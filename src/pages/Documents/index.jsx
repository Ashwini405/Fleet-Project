import React, { useState } from "react";
import { Folder, Upload, Search, FileText, Download, Trash2, File } from "lucide-react";
import { mockDocuments, documentCategories } from "./data/mockData";

export default function Documents() {
  const [activeCategory, setActiveCategory] = useState("All Documents");
  const [search, setSearch] = useState("");
  const [docs, setDocs] = useState(mockDocuments);
  const [isUploading, setIsUploading] = useState(false);

  const filteredDocs = docs.filter(doc => 
    (activeCategory === "All Documents" || doc.category === activeCategory) &&
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadClick = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 1500);
  };

  const deleteDoc = (id) => {
    if (window.confirm("Delete this document permanently?")) {
      setDocs(docs.filter(d => d.id !== id));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Folder className="w-8 h-8 text-indigo-600" /> Document Vault
          </h1>
          <p className="text-gray-500 mt-1">Manage global records, insurances, and contracts in one secure hub.</p>
        </div>
        <button 
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Upload className="w-5 h-5"/>}
          Upload File
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {documentCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Vault Area */}
        <div className="flex-1">
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden auto-cols-min w-full">
            <table className="w-full text-left text-xs md:text-sm table-auto max-w-full">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-100">
                <tr>
                  <th className="py-2 px-2 md:px-6 md:py-4">Document Name</th>
                  <th className="py-2 px-2 md:px-6 md:py-4 hidden md:table-cell">Category</th>
                  <th className="py-2 px-2 md:px-6 md:py-4 hidden sm:table-cell">Size & Date</th>
                  <th className="py-2 px-2 md:px-6 md:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition group">
                    <td className="py-2 md:py-4 px-2 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                          {doc.name.endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-xs md:text-sm break-words">{doc.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Uploaded by {doc.uploadedBy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-2 md:px-6 hidden md:table-cell font-medium text-gray-600 text-xs md:text-sm">
                      {doc.category}
                    </td>
                    <td className="py-2 md:py-4 px-2 md:px-6 hidden sm:table-cell">
                      <div className="text-gray-800 font-medium text-xs md:text-sm">{doc.size}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{doc.date}</div>
                    </td>
                    <td className="py-2 md:py-4 px-2 md:px-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-indigo-600 hover:border-indigo-200 transition" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteDoc(doc.id)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-red-600 hover:border-red-200 transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                      No documents found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

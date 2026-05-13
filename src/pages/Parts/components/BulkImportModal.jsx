import React, {
  useState
} from 'react';

import {
  AnimatePresence,
  motion
} from 'framer-motion';

import {
  X,
  UploadCloud,
  FileWarning,
  CheckCircle2,
  Loader2
} from 'lucide-react';


// ======================================================
// ✅ COMPONENT
// ======================================================

export default function BulkImportModal({

  isOpen,

  onClose,

  onImport

}) {

  const [csvText, setCsvText] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  // ======================================================
  // ✅ CLOSE
  // ======================================================

  if (!isOpen)
    return null;


  // ======================================================
  // ✅ IMPORT
  // ======================================================

  const handleSubmit = async () => {

    setError('');
    setMessage('');

    const cleaned =
      csvText.trim();

    if (!cleaned) {

      setError(
        'Paste CSV text or upload a CSV file first.'
      );

      return;
    }

    try {

      setLoading(true);

      const result =
        await onImport(cleaned);

      if (!result?.success) {

        setError(

          result?.error ||

          'CSV import failed.'
        );

        return;
      }

      setMessage(

        `Imported ${result.imported || 0} inventory items successfully.`
      );

      setCsvText('');

    }

    catch (err) {

      setError(
        'Something went wrong while importing CSV.'
      );
    }

    finally {

      setLoading(false);
    }
  };


  // ======================================================
  // ✅ FILE UPLOAD
  // ======================================================

  const handleFile = (e) => {

    const file =
      e.target.files?.[0];

    if (!file)
      return;


    // ONLY CSV

    if (

      !file.name
        .toLowerCase()
        .endsWith('.csv')

    ) {

      setError(
        'Only CSV files are allowed.'
      );

      return;
    }


    // MAX SIZE 5MB

    if (file.size > 5 * 1024 * 1024) {

      setError(
        'CSV file is too large. Max 5MB allowed.'
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {

      setCsvText(
        String(reader.result || '')
      );

      setError('');

      setMessage('');
    };

    reader.onerror = () => {

      setError(
        'Failed to read CSV file.'
      );
    };

    reader.readAsText(file);
  };


  return (

    <AnimatePresence>

      {isOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              translateY: 16
            }}
            animate={{
              opacity: 1,
              translateY: 0
            }}
            exit={{
              opacity: 0,
              translateY: 16
            }}
            className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
          >

            {/* ====================================================== */}
            {/* HEADER */}
            {/* ====================================================== */}

            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-slate-50">

              <div className="flex items-center gap-3">

                <UploadCloud className="h-5 w-5 text-slate-700" />

                <div>

                  <h2 className="text-lg font-bold text-slate-900">

                    Bulk Import Parts

                  </h2>

                  <p className="text-sm text-slate-500">

                    Paste CSV or upload a file with inventory rows.

                  </p>

                </div>

              </div>


              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
              >

                <X className="h-4 w-4" />

              </button>

            </div>


            {/* ====================================================== */}
            {/* BODY */}
            {/* ====================================================== */}

            <div className="space-y-5 px-6 py-6">

              {/* CSV INFO */}

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">

                <p className="text-sm font-semibold text-slate-700">

                  Expected CSV Columns

                </p>

                <p className="mt-3 text-xs text-slate-500 leading-6">

                  name,
                  category,
                  brand,
                  unit,
                  minStock,
                  currentStock,
                  costPrice,
                  sellingPrice,
                  preferredVendor,
                  warehouse,
                  createdDate

                </p>

              </div>


              {/* TEXTAREA */}

              <div>

                <label className="block text-sm font-bold uppercase tracking-[0.22em] text-slate-500 mb-3">

                  Paste CSV Data

                </label>

                <textarea
                  rows="10"
                  value={csvText}
                  onChange={(e) =>
                    setCsvText(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                  placeholder="Paste CSV rows here..."
                />

              </div>


              {/* FILE + MESSAGES */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <label className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition">

                  <UploadCloud className="h-4 w-4" />

                  Upload CSV File

                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFile}
                    disabled={loading}
                  />

                </label>


                {/* SUCCESS */}

                {message && (

                  <p className="flex items-center gap-1 text-sm text-emerald-600 font-semibold">

                    <CheckCircle2 className="h-4 w-4" />

                    {message}

                  </p>
                )}


                {/* ERROR */}

                {error && (

                  <p className="flex items-center gap-1 text-sm text-red-600 font-semibold">

                    <FileWarning className="h-4 w-4" />

                    {error}

                  </p>
                )}

              </div>

            </div>


            {/* ====================================================== */}
            {/* FOOTER */}
            {/* ====================================================== */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
              >

                Close

              </button>


              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition disabled:opacity-60"
              >

                {loading && (

                  <Loader2 className="h-4 w-4 animate-spin" />

                )}

                {loading
                  ? 'Importing...'
                  : 'Import CSV'}

              </button>

            </div>

          </motion.div>

        </div>
      )}

    </AnimatePresence>
  );
}
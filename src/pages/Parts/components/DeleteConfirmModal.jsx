import React, {
  useState
} from 'react';

import {
  AnimatePresence,
  motion
} from 'framer-motion';

import {
  AlertTriangle,
  Trash2,
  X,
  Loader2
} from 'lucide-react';


// ======================================================
// ✅ COMPONENT
// ======================================================

export default function DeleteConfirmModal({

  item,

  onClose,

  onConfirm

}) {

  const [deleting, setDeleting] =
    useState(false);


  // ======================================================
  // ✅ EXIT
  // ======================================================

  if (!item)
    return null;


  // ======================================================
  // ✅ SAFE VALUES
  // ======================================================

  const stock =
    Number(
      item.currentStock || 0
    );

  const initials =
    (item.name || 'NA')
      .slice(0, 2)
      .toUpperCase();


  // ======================================================
  // ✅ DELETE
  // ======================================================

  const handleDelete = async () => {

    try {

      setDeleting(true);

      await onConfirm(item.id);

      onClose();

    }

    catch (err) {

      console.error(
        'DELETE ERROR:',
        err
      );
    }

    finally {

      setDeleting(false);
    }
  };


  return (

    <AnimatePresence>

      {item && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.93,
              y: 12
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.93,
              y: 12
            }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 28
            }}
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
          >

            {/* ====================================================== */}
            {/* HEADER */}
            {/* ====================================================== */}

            <div className="bg-red-50 border-b border-red-100 px-5 py-4 flex items-center gap-3">

              <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">

                <AlertTriangle className="h-[18px] w-[18px] text-red-600" />

              </div>


              <div className="flex-1 min-w-0">

                <p className="text-sm font-black text-red-700">

                  Delete Part

                </p>

                <p className="text-[10px] text-red-400 font-medium">

                  This action cannot be undone

                </p>

              </div>


              <button
                onClick={onClose}
                disabled={deleting}
                className="rounded-lg p-1 text-red-300 hover:text-red-600 hover:bg-red-100 transition disabled:opacity-50"
              >

                <X className="h-4 w-4" />

              </button>

            </div>


            {/* ====================================================== */}
            {/* BODY */}
            {/* ====================================================== */}

            <div className="px-5 py-5 space-y-4">

              {/* PART CARD */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-3">

                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0">

                  {initials}

                </div>


                <div className="min-w-0">

                  <p className="text-sm font-bold text-slate-800 truncate">

                    {item.name || 'Unknown Part'}

                  </p>

                  <p className="text-[10px] text-slate-400 font-mono truncate">

                    {item.partCode || 'N/A'}
                    {' · '}
                    {item.brand || 'N/A'}

                  </p>

                </div>

              </div>


              {/* MESSAGE */}

              <p className="text-sm text-slate-600 leading-relaxed">

                Are you sure you want to delete
                {' '}

                <span className="font-bold text-slate-800">

                  {item.name || 'this part'}

                </span>

                ?

                {' '}

                All stock records, movement history, and related inventory data will be permanently removed.

              </p>


              {/* STOCK WARNING */}

              {stock > 0 && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -4
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5"
                >

                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />

                  <p className="text-[11px] font-semibold text-amber-700">

                    This part still has
                    {' '}

                    <span className="font-black">

                      {stock}
                      {' '}
                      {item.unit || ''}

                    </span>

                    {' '}
                    in stock.

                  </p>

                </motion.div>
              )}

            </div>


            {/* ====================================================== */}
            {/* FOOTER */}
            {/* ====================================================== */}

            <div className="flex items-center gap-2 px-5 pb-5">

              <button
                onClick={onClose}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >

                Cancel

              </button>


              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >

                {deleting ? (

                  <>

                    <Loader2 className="h-4 w-4 animate-spin" />

                    Deleting...

                  </>

                ) : (

                  <>

                    <Trash2 className="h-4 w-4" />

                    Delete Part

                  </>

                )}

              </button>

            </div>

          </motion.div>

        </div>
      )}

    </AnimatePresence>
  );
}
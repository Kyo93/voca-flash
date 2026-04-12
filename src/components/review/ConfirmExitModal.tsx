import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmExitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmExitModal({ isOpen, onClose, onConfirm }: ConfirmExitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-arena-container w-full max-w-sm p-12 text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] border-white/20"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 text-red-500 flex items-center justify-center mb-10 mx-auto border border-red-500/20 shadow-2xl">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-6 text-shadow-glow tracking-tight">Thoát đấu trường?</h2>
            <p className="text-white/40 mb-12 text-base font-medium leading-[1.6]">
              Tiến độ của bạn sẽ luôn được bảo lưu. Bạn có muốn tạm dừng và quay lại sau không?
            </p>
    
            <div className="flex flex-col gap-4">
              <button
                onClick={onConfirm}
                className="w-full py-5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Thoát ngay
              </button>
              <button
                onClick={onClose}
                className="w-full py-5 glass-arena-item text-white font-black rounded-2xl hover:bg-white/10 active:scale-95 transition-all border-white/10"
              >
                Ở lại luyện tập
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

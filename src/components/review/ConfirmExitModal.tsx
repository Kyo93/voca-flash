import { Link } from 'react-router-dom'

interface ConfirmExitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmExitModal({ isOpen, onClose, onConfirm }: ConfirmExitModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#16161a] border border-white/10 rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mb-8 mx-auto">
          <span className="material-symbols-outlined text-4xl">exit_to_app</span>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-4">Bạn muốn thoát?</h2>
        <p className="text-white/40 mb-10 text-sm leading-relaxed">
          Tiến độ hiện tại của buổi ôn tập sẽ được lưu lại. Bạn có thể quay lại bất cứ lúc nào.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 active:scale-95 transition-all"
          >
            Thoát ngay
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 active:scale-95 transition-all"
          >
            Ở lại luyện tập
          </button>
        </div>
      </div>
    </div>
  )
}

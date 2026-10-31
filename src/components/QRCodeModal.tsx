import React, { useEffect, useState } from 'react';
import { X, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { AppTheme } from '../types';
import { soundFx } from '../utils/soundEffects';

interface QRCodeModalProps {
  theme?: AppTheme;
  password: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ theme = 'light', password, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const isLight = theme === 'light';

  useEffect(() => {
    if (password && isOpen) {
      QRCode.toDataURL(password, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrUrl(url))
        .catch(() => {});
    }
  }, [password, isOpen]);

  if (!isOpen) return null;

  const downloadPng = () => {
    soundFx.playClick();
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `password_qr_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`border rounded-3xl max-w-xs sm:max-w-sm w-full p-4 sm:p-6 shadow-2xl space-y-4 relative ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-xl border transition-colors ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1 pt-1">
          <h3 className={`text-base font-bold flex items-center justify-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span>QR-код пароля</span>
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Отсканируйте камерой смартфона для ввода на мобильном устройстве
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-inner border border-slate-200 flex justify-center items-center">
          {qrUrl ? (
            <img src={qrUrl} alt="Password QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 font-mono text-xs">
              Генерация QR...
            </div>
          )}
        </div>

        <div className="pt-1">
          <button
            onClick={downloadPng}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Скачать PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

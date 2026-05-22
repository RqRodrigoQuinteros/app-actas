import { useEffect } from 'react';

export default function RodrigoAdminTest() {
  console.log('=== TEST RodrigoAdminTest CARGADO ===');
  
  useEffect(() => {
    console.log('=== TEST useEffect ejecutado ===');
    console.log('localStorage usuario:', localStorage.getItem('usuario'));
    console.log('localStorage token:', localStorage.getItem('token') ? '[EXISTE]' : '[NO EXISTE]');
    
    alert('COMPONENTE CARGADO! Mirá la consola (F12)');
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">RUTA FUNCIONA!</h1>
        <p className="text-gray-600 mb-4">El routing está OK. El problema es la auth.</p>
        <p className="text-sm text-gray-400">Abrí la consola (F12) para ver los logs</p>
      </div>
    </div>
  );
}

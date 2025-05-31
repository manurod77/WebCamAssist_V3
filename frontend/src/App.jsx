import { useState } from 'react';

export default function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [tone, setTone] = useState('coqueta');
  const [intensity, setIntensity] = useState('media');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [filterTone, setFilterTone] = useState('todos');

  const generateResponse = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tone, intensity }),
      });
      const data = await res.json();
      setResponse(data.reply);
      setHistory((prev) => [{ prompt: message, reply: data.reply, tone, intensity }, ...prev]);
    } catch (err) {
      setResponse('Error al generar la respuesta. Intenta nuevamente.');
    }
    setLoading(false);
  };

  const saveFavorite = () => {
    if (response && !favorites.includes(response)) {
      setFavorites([...favorites, response]);
    }
  };

  const exportFavorites = () => {
    const blob = new Blob([favorites.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'respuestas_favoritas.txt';
    link.click();
  };

  const filteredHistory = filterTone === 'todos' ? history : history.filter((entry) => entry.tone === filterTone);

  const deleteHistoryItem = (index) => {
    const updated = [...history];
    updated.splice(index, 1);
    setHistory(updated);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Generador de Respuestas Creativas</h1>
      <textarea
        placeholder="Escribe un mensaje para generar una respuesta..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <div className="flex gap-2 justify-center my-2">
        {['coqueta', 'divertida', 'misteriosa', 'filosófica'].map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded ${
              tone === t ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setTone(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-center mb-4">
        {['baja', 'media', 'alta'].map((level) => (
          <button
            key={level}
            className={`px-3 py-1 rounded ${
              intensity === level ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setIntensity(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={generateResponse}
          disabled={loading || !message}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar Respuesta'}
        </button>
        {response && (
          <button onClick={saveFavorite} className="px-4 py-2 bg-gray-500 text-white rounded">
            Guardar
          </button>
        )}
        {favorites.length > 0 && (
          <button onClick={exportFavorites} className="px-4 py-2 border rounded">
            Exportar Favoritas
          </button>
        )}
      </div>
      {response && (
        <div className="p-4 border rounded bg-gray-100 whitespace-pre-wrap">{response}</div>
      )}

      {history.length > 0 && (
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Historial de Respuestas</h2>
            <select
              value={filterTone}
              onChange={(e) => setFilterTone(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="todos">Todos los tonos</option>
              <option value="coqueta">Coqueta</option>
              <option value="divertida">Divertida</option>
              <option value="misteriosa">Misteriosa</option>
              <option value="filosófica">Filosófica</option>
            </select>
          </div>
          <ul>
            {filteredHistory.map((entry, i) => (
              <li
                key={i}
                className="border-b py-2 flex justify-between items-start gap-2"
              >
                <div>
                  <strong>Prompt:</strong> {entry.prompt}
                  <br />
                  <strong>Respuesta:</strong> {entry.reply}
                  <br />
                  <em className="text-xs text-gray-600">
                    Tono: {entry.tone}, Intensidad: {entry.intensity}
                  </em>
                </div>
                <button
                  className="text-red-500 font-bold"
                  onClick={() => deleteHistoryItem(i)}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

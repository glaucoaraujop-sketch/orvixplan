import { useState, useEffect, useRef } from 'react'
import { TaskRow } from '../components/TaskRow.jsx'
import { AddTaskForm } from '../components/AddTaskForm.jsx'
import { AIPanel } from '../components/AIPanel.jsx'
import { PillarBadge } from '../components/PillarBadge.jsx'
import { PILLARS } from '../constants/pillars.js'
import { calcDayPct, calcPillarBreakdown } from '../utils/statsUtils.js'
import { formatDateFull } from '../utils/dateUtils.js'

const AI_MODES = [
  { id: 'suggest',  label: 'Sugerir dia',  icon: '✨' },
  { id: 'optimize', label: 'Otimizar',     icon: '⚡' },
  { id: 'reflect',  label: 'Refletir',     icon: '🌙' },
  { id: 'chat',     label: 'Chat',         icon: '💬' },
]

export function DailyView({ date, getDay, addTask, deleteTask, toggleCheck, saveJournal, ai, settings }) {
  const [showForm,    setShowForm]    = useState(false)
  const [aiResponse,  setAiResponse]  = useState(null)
  const [aiMode,      setAiMode]      = useState(null)
  const [chatMsg,     setChatMsg]     = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [notes,       setNotes]       = useState('')
  const [saveStatus,  setSaveStatus]  = useState(null) // 'saving' | 'saved' | null
  const saveTimer  = useRef(null)
  const prevDateRef = useRef(null)

  // Sync notes when date changes
  useEffect(() => {
    if (prevDateRef.current !== date.toDateString()) {
      prevDateRef.current = date.toDateString()
      setNotes(savedNotes || '')
      setSaveStatus(null)
      clearTimeout(saveTimer.current)
    }
  }, [date, savedNotes])

  const handleNotesChange = (e) => {
    const val = e.target.value
    setNotes(val)
    setSaveStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await saveJournal(date, val)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    }, 1500)
  }

  const pct       = calcDayPct(allTasks, checks)
  const byPillar  = calcPillarBreakdown(allTasks, checks)

  const doneTasks    = allTasks.filter((t) => checks[t.id]).map((t) => t.label).join(', ')
  const pendingTasks = allTasks.filter((t) => !checks[t.id]).map((t) => t.label).join(', ')
  const taskList     = allTasks.map((t) => `${t.time} — ${t.label} [${t.pillar}]`).join('\n')
  const dayCtx       = `Data: ${formatDateFull(date)}\nTarefas: ${taskList}\nProgresso: ${pct}%`

  const handleAI = async (mode) => {
    setAiMode(mode)
    setAiResponse(null)
    try {
      let text
      if (mode === 'suggest')  text = await ai.suggestDay(formatDateFull(date))
      if (mode === 'optimize') text = await ai.optimizeDay(taskList)
      if (mode === 'reflect')  text = await ai.reflectDay(pct, doneTasks, pendingTasks)
      if (text) setAiResponse(text)
    } catch {}
  }

  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatMsg.trim()) return
    const msg = chatMsg
    setChatMsg('')
    setAiResponse(null)
    try {
      const reply = await ai.chat(msg, dayCtx, chatHistory)
      setChatHistory((h) => [
        ...h,
        { role: 'user', content: msg },
        { role: 'assistant', content: reply },
      ])
      setAiResponse(reply)
    } catch {}
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 4px' }}>
      {/* Progress */}
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 14,
          border: '1px solid #EEF0FF',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B' }}>
            Progresso do dia
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: pct >= 80 ? '#16A34A' : pct >= 50 ? '#4338CA' : '#D97706',
            }}
          >
            {pct}%
          </span>
        </div>

        {/* Bar */}
        <div style={{ height: 8, background: '#EEF0FF', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: pct >= 80 ? '#16A34A' : pct >= 50 ? '#4338CA' : '#D97706',
              borderRadius: 99,
              transition: 'width .4s',
            }}
          />
        </div>

        {/* Pillar breakdown */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PILLARS.map((p) => {
            const { total, done } = byPillar[p.id] || { total: 0, done: 0 }
            if (!total) return null
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: p.light,
                  fontSize: 12,
                  color: p.text,
                  fontWeight: 600,
                }}
              >
                <span>{p.emoji}</span>
                <span>{done}/{total}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 14,
          border: '1px solid #EEF0FF',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B' }}>
            Tarefas — {allTasks.length} no total
          </span>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: '#4338CA',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Adicionar
          </button>
        </div>

        {showForm && (
          <AddTaskForm onAdd={(t) => addTask(date, t)} onClose={() => setShowForm(false)} />
        )}

        {allTasks.length === 0 && !showForm && (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, padding: '20px 0' }}>
            Nenhuma tarefa. Adicione uma ou peça à IA para sugerir o dia.
          </p>
        )}

        {allTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            checked={!!checks[task.id]}
            onToggle={() => toggleCheck(date, task.id, task.fixed)}
            onDelete={() => deleteTask(date, task.id)}
          />
        ))}
      </div>

      {/* AI Section */}
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #EEF0FF',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
          IA Assistente
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: aiMode === 'chat' ? 10 : 0 }}>
          {AI_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => m.id !== 'chat' ? handleAI(m.id) : setAiMode('chat')}
              disabled={ai.loading}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: `1.5px solid ${aiMode === m.id ? '#4338CA' : '#E0E7FF'}`,
                background: aiMode === m.id ? '#EEF0FF' : 'white',
                color: aiMode === m.id ? '#4338CA' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: ai.loading && aiMode !== m.id ? .5 : 1,
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {aiMode === 'chat' && (
          <form onSubmit={handleChat} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Pergunte algo sobre seu dia…"
              style={{
                flex: 1,
                border: '1.5px solid #E0E7FF',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                color: '#1E1B4B',
              }}
            />
            <button
              type="submit"
              disabled={ai.loading || !chatMsg.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#4338CA',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: ai.loading ? .6 : 1,
              }}
            >
              Enviar
            </button>
          </form>
        )}

        <AIPanel
          content={aiResponse}
          loading={ai.loading}
          error={ai.error}
          onClose={() => { setAiResponse(null); setAiMode(null) }}
        />

        {/* Chat history */}
        {aiMode === 'chat' && chatHistory.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 300, overflowY: 'auto' }}>
            {chatHistory.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  marginBottom: 6,
                  fontSize: 13,
                  lineHeight: 1.6,
                  background: h.role === 'user' ? '#F5F3FF' : '#F9FAFB',
                  color: h.role === 'user' ? '#4338CA' : '#374151',
                  alignSelf: h.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 11, opacity: .7, marginRight: 4 }}>
                  {h.role === 'user' ? 'Você' : '✨ IA'}
                </span>
                {h.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journal */}
      <div style={{
        background: 'white', borderRadius: 14,
        padding: '16px 18px', marginTop: 14,
        border: '1px solid #EEF0FF',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            📝 Diário do dia
          </p>
          {saveStatus === 'saving' && (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Salvando…</span>
          )}
          {saveStatus === 'saved' && (
            <span style={{ fontSize: 11, color: '#16A34A' }}>✓ Salvo</span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Como foi seu dia? Coisas boas, dificuldades, estresse, pendências, aprendizados…"
          rows={5}
          style={{
            width: '100%',
            border: '1.5px solid #E0E7FF',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 14,
            fontFamily: 'inherit',
            lineHeight: 1.6,
            color: '#1E1B4B',
            resize: 'vertical',
            outline: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

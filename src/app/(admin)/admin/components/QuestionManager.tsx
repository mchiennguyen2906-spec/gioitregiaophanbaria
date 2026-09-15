import React, { useState, useEffect } from 'react';
import { getQuestionsFromStore, markQuestionAnswered, deleteQuestion, Question } from "../../../utils/store";

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setQuestions(getQuestionsFromStore());
  }, []);

  const handleMarkAnswered = (id: string) => {
    markQuestionAnswered(id);
    setQuestions(getQuestionsFromStore());
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      deleteQuestion(id);
      setQuestions(getQuestionsFromStore());
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Tổng hợp Câu hỏi (Góc Tâm Lý)</h2>
        <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
          Tổng cộng: {questions.length} câu hỏi
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
            <th style={{ padding: '12px', width: '5%' }}>STT</th>
            <th style={{ padding: '12px', width: '15%' }}>Người gửi</th>
            <th style={{ padding: '12px', width: '35%' }}>Nội dung câu hỏi</th>
            <th style={{ padding: '12px', width: '15%' }}>Gửi đến</th>
            <th style={{ padding: '12px', width: '15%' }}>Trạng Thái</th>
            <th style={{ padding: '12px', width: '15%', textAlign: 'center' }}>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Chưa có câu hỏi nào.
              </td>
            </tr>
          ) : (
            questions.map((q, index) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #e2e8f0', background: q.status === 'new' ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '15px 12px', fontWeight: 'bold', color: '#94a3b8' }}>{index + 1}</td>
                <td style={{ padding: '15px 12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{q.senderName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{q.senderContact}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(q.createdAt).toLocaleDateString('vi-VN')}</div>
                </td>
                <td style={{ padding: '15px 12px', color: '#334155', lineHeight: 1.5 }}>
                  {q.questionText}
                </td>
                <td style={{ padding: '15px 12px', fontWeight: '500', color: '#0369a1' }}>
                  {q.recipient}
                </td>
                <td style={{ padding: '15px 12px' }}>
                  {q.status === 'new' ? (
                    <span style={{ padding: '4px 10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Chưa giải đáp</span>
                  ) : (
                    <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Đã giải đáp</span>
                  )}
                </td>
                <td style={{ padding: '15px 12px', textAlign: 'center' }}>
                  {q.status === 'new' && (
                    <button onClick={() => handleMarkAnswered(q.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '5px', width: '100%' }}>
                      Đánh dấu Xong
                    </button>
                  )}
                  <button onClick={() => handleDelete(q.id)} style={{ background: '#f1f5f9', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', width: '100%' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getQuestionsFromStore, markQuestionAnswered, deleteQuestion, Question } from "../../../utils/store";
import toast from 'react-hot-toast';

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'delete' | 'mark' } | null>(null);

  useEffect(() => {
    const loadQuestions = async () => setQuestions(await getQuestionsFromStore());
    loadQuestions();
    window.addEventListener('storage_update', loadQuestions);
    return () => window.removeEventListener('storage_update', loadQuestions);
  }, []);

  const requestMarkAnswered = (id: string) => {
    setConfirmAction({ id, type: 'mark' });
    setShowConfirmModal(true);
  };

  const requestDelete = (id: string) => {
    setConfirmAction({ id, type: 'delete' });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'mark') {
        await markQuestionAnswered(confirmAction.id);
        toast.success('Đã đánh dấu câu hỏi đã giải đáp!');
      } else if (confirmAction.type === 'delete') {
        await deleteQuestion(confirmAction.id);
        toast.success('Đã xóa câu hỏi thành công!');
      }
    } catch (err: any) {
      toast.error('Có lỗi xảy ra: ' + err.message);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
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
                    <button onClick={() => requestMarkAnswered(q.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '5px', width: '100%' }}>
                      Đánh dấu Xong
                    </button>
                  )}
                  <button onClick={() => requestDelete(q.id)} style={{ background: '#f1f5f9', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', width: '100%' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Xác nhận thao tác</h3>
            <p style={{ color: '#475569', marginBottom: '25px', lineHeight: 1.5 }}>
              {confirmAction?.type === 'mark' 
                ? 'Bạn có chắc chắn muốn đánh dấu câu hỏi này là đã giải đáp không? (Thao tác này sẽ cập nhật trên giao diện web)' 
                : 'Bạn có chắc chắn muốn xóa vĩnh viễn câu hỏi này không? Thao tác này không thể hoàn tác.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={cancelAction}
                style={{ padding: '10px 15px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmAction}
                style={{ 
                  padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: 'white',
                  background: confirmAction?.type === 'mark' ? 'var(--color-brand-cyan)' : '#ef4444' 
                }}
              >
                {confirmAction?.type === 'mark' ? 'Đánh dấu Xong' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

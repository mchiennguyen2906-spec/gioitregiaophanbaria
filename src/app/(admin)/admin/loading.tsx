"use client";
import React from "react";

export default function AdminLoading() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ height: '32px', width: '250px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ height: '40px', width: '120px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </div>
      
      {/* Toolbar Skeleton */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ height: '40px', width: '200px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ height: '40px', width: '150px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </div>
      
      {/* Table Skeleton */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '50px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px' }}>
            <div style={{ height: '20px', width: '40px', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ height: '20px', flex: 1, background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ height: '20px', width: '100px', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ height: '30px', width: '80px', background: '#e2e8f0', borderRadius: '15px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}

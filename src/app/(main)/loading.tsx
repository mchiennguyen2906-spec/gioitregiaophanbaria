"use client";
import React from "react";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className="container" style={{ padding: '60px 0', minHeight: '60vh' }}>
      {/* Hero Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div style={{ height: '450px', background: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ background: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        </div>
      </div>
      
      {/* Title Skeleton */}
      <div style={{ height: '30px', width: '200px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '20px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      
      {/* Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: '200px', background: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '4px', width: '90%', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', width: '60%', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
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

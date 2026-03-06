'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackToTopCom from '@/components/common/back-to-top';

const ProductModal = dynamic(() => import('@/components/common/product-modal'), {
  ssr: false,
  loading: () => null,
});

export default function PublicClientShell({ children, enableProductModal = false, enableToasts = true }) {
  const productItem = useSelector((state) => state?.productModal?.productItem);

  return (
    <div id="wrapper">
      {children}
      <BackToTopCom />
      {enableToasts ? <ToastContainer position="bottom-center" autoClose={3000} /> : null}
      {enableProductModal && productItem ? <ProductModal /> : null}
    </div>
  );
}

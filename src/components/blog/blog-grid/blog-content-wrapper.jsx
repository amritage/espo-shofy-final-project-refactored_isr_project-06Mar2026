import React from 'react';
import SectionTitle from './section-title';
import BlogGridArea from './blog-grid-area';

export default function BlogContentWrapper({ tagname = null, blogs = [] }) {
  return (
    <>
      <SectionTitle />
      <BlogGridArea blogs={blogs} tagname={tagname} />
    </>
  );
}

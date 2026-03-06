import React from 'react';
import ModernBlogCard from './modern-blog-card';
import styles from './ModernBlog.module.scss';
import { filterBlogsByTag, sortBlogsByDate } from '@/lib/public-content-api';

export default function BlogGridArea({ blogs = [], tagname = null }) {
  const selectedTag = tagname;
  const sortedBlogs = sortBlogsByDate(blogs);
  const filteredBlogs = selectedTag ? filterBlogsByTag(sortedBlogs, selectedTag) : sortedBlogs;

  return (
    <section className={`${styles.modernBlogArea} py-5`}>
      <div className="container">
        {selectedTag ? (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0">
                Showing blogs tagged with: <span className="badge bg-primary">{selectedTag}</span>
              </h5>
              <a href="/blog" className="btn btn-sm btn-outline-secondary">
                Clear Filter
              </a>
            </div>
          </div>
        ) : null}

        <div className={styles.modernBlogGrid}>
          {filteredBlogs.map((blog, index) => (
            <ModernBlogCard key={blog._id || blog.id || index} blog={blog} index={index} />
          ))}
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-5">
            {selectedTag ? (
              <>
                <p className="text-muted">No blog posts found with tag &quot;{selectedTag}&quot;.</p>
                <a href="/blog" className="btn btn-primary mt-3">
                  View All Blogs
                </a>
              </>
            ) : (
              <p className="text-muted">No blog posts found.</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

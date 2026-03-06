'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiShare2 } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function HomePageTwoClient({ officeInfo = null }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (event) => {
      const root = document.getElementById('age-social-share-root');
      if (root && event?.target && !root.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEsc = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const links = useMemo(() => {
    const office = officeInfo || {};

    return [
      { id: 'fb', icon: <FaFacebookF />, color: '#1877F2', href: office.facebookUrl || 'https://facebook.com' },
      { id: 'ig', icon: <FaInstagram />, color: '#E1306C', href: office.instagramUrl || 'https://instagram.com' },
      { id: 'ln', icon: <FaLinkedinIn />, color: '#0A66C2', href: office.linkedinUrl || 'https://linkedin.com' },
      { id: 'yt', icon: <FaYoutube />, color: '#FF0000', href: office.youtubeUrl || 'https://youtube.com' },
      { id: 'tw', icon: <FaXTwitter />, color: '#000000', href: office.xUrl || 'https://twitter.com' },
    ];
  }, [officeInfo]);

  if (!mounted) return null;

  return createPortal(
    <div id="age-social-share-root" className="age-social-root">
      <button
        type="button"
        className={`age-social-toggle ${open ? 'is-open' : ''}`}
        aria-label="Share"
        title="Share"
        onClick={() => setOpen((value) => !value)}
      >
        <FiShare2 size={20} />
      </button>

      <ul className={`age-social-items ${open ? 'show' : ''}`} aria-hidden={!open}>
        {links.map((social, index) => (
          <li
            key={social.id}
            className="age-social-item"
            style={{
              background: social.color,
              '--d': `${index * 70}ms`,
            }}
          >
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.id}
              title={social.id}
            >
              {social.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
}

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Redirects /categories/:slug to /courses?category=:slug
 * so the CourseCatalogPage handles display with the category pre-selected.
 */
export default function CategoryRedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/courses?category=${slug || ''}`, { replace: true });
  }, [slug, navigate]);

  return null;
}

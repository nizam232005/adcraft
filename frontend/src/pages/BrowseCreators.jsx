import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { SkeletonGrid } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { Search, UserCheck, Sparkles, ExternalLink, Tag } from 'lucide-react';

const popularSkills = [
  'All',
  'Video Editing',
  'UGC Content',
  'Instagram Ads',
  'TikTok Ads',
  'Graphic Design',
  'Copywriting',
  'Voiceover',
];

export default function BrowseCreators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async (searchQuery = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await api.get(`/users/creators?${params.toString()}`);
      setCreators(res.data);
    } catch (err) {
      console.error('Failed to fetch creators', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedTag('All');
    fetchCreators(search);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    if (tag === 'All') {
      setSearch('');
      fetchCreators('');
    } else {
      setSearch(tag);
      fetchCreators(tag);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              <Sparkles size={16} />
              <span>Creator Discovery Directory</span>
            </div>
            <h1 className="page-title">Find & Hire Top Ad Creators</h1>
            <p className="page-subtitle">
              Browse freelance video creators, UGC specialists, and graphic designers. Inspect portfolios and invite talent to your ad campaigns.
            </p>
          </div>
        </div>

        {/* Search Bar & Skill Tags */}
        <div style={{ marginBottom: 28 }}>
          <form onSubmit={handleSearchSubmit} className="search-container" style={{ marginBottom: 16 }}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Search creators by name, skill (e.g. Video Editing, UGC, Copywriting), or bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
              Search
            </button>
          </form>

          {/* Quick Skill Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tag size={14} /> Popular Skills:
            </span>
            {popularSkills.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: selectedTag === tag ? 'var(--primary)' : 'var(--gray-200)',
                  background: selectedTag === tag ? 'var(--primary-50)' : 'var(--white)',
                  color: selectedTag === tag ? 'var(--primary-dark)' : 'var(--gray-700)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : creators.length === 0 ? (
          <EmptyState
            title="No creators found"
            message="No creators matched your search query. Try clearing filters or searching for different skills."
          />
        ) : (
          <div className="grid-3 stagger">
            {creators.map((creator) => {
              const skillList = creator.skills ? creator.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
              
              return (
                <div
                  key={creator.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 24,
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div>
                    {/* Header: Avatar + Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      {creator.profile_image ? (
                        <img
                          src={creator.profile_image}
                          alt={creator.name}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--primary-100)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            color: 'white',
                            fontSize: 22,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {creator.name?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div style={{ overflow: 'hidden' }}>
                        <h3
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--gray-900)',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {creator.name}
                        </h3>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--primary-dark)',
                            background: 'var(--primary-50)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            marginTop: 4,
                          }}
                        >
                          <UserCheck size={12} /> Verified Creator
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--gray-600)',
                        lineHeight: 1.5,
                        marginBottom: 16,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {creator.bio || 'No bio provided yet. Explore their showcase portfolio to view past creative work.'}
                    </p>

                    {/* Skills Tags */}
                    {skillList.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                        {skillList.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              background: 'var(--gray-100)',
                              color: 'var(--gray-700)',
                              padding: '3px 10px',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {skillList.length > 4 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--gray-500)',
                              alignSelf: 'center',
                            }}
                          >
                            +{skillList.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Links */}
                  <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16, marginTop: 8, display: 'flex', gap: 8 }}>
                    <Link
                      to={`/profile/${creator.id}`}
                      className="btn btn-outline btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <span>Profile</span>
                      <ExternalLink size={14} />
                    </Link>
                    <Link
                      to={`/messages/${creator.id}`}
                      className="btn btn-primary btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <span>Message</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

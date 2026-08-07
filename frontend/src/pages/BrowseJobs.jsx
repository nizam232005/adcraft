import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function BrowseJobs() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchJobs();
  }, [page, platform, sort]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        sort,
      });

      if (keyword) params.append('keyword', keyword);
      if (platform) params.append('platform', platform);

      const res = await api.get(`/projects/?${params.toString()}`);
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-title">Browse Advertisement Jobs</h1>
            <p className="page-subtitle">Find high-paying video and image ad opportunities for your content platform.</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by keyword, brand, or product..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="form-input form-select"
              style={{ width: 140 }}
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
            >
              <option value="">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>

            <select
              className="form-input form-select"
              style={{ width: 160 }}
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <option value="newest">Newest First</option>
              <option value="highest_budget">Highest Budget</option>
              <option value="lowest_budget">Lowest Budget</option>
            </select>

            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No ad projects found"
            message="Try adjusting your search query or filters to find open opportunities."
          />
        ) : (
          <>
            <div className="grid-3 stagger">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  linkPrefix="/creator/jobs"
                />
              ))}
            </div>

            <Pagination
              page={page}
              pages={pages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

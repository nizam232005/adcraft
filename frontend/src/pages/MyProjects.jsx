import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import { SkeletonGrid } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { PlusCircle, Filter } from 'lucide-react';

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const res = await api.get('/projects/my');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Projects</h1>
            <p className="page-subtitle">View, edit, and manage all your advertisement campaigns.</p>
          </div>
          <Link to="/brand/projects/create" className="btn btn-primary">
            <PlusCircle size={18} /> Create Project
          </Link>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'open', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            message={
              filter === 'all'
                ? "You haven't created any advertisement projects yet."
                : `No projects with status '${filter.replace('_', ' ')}'.`
            }
            action={
              filter === 'all' && (
                <Link to="/brand/projects/create" className="btn btn-primary">
                  <PlusCircle size={18} /> Create Project
                </Link>
              )
            }
          />
        ) : (
          <div className="grid-3 stagger">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                linkPrefix="/brand/projects"
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

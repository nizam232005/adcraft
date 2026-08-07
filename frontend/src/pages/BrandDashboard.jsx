import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { SkeletonGrid, SkeletonStat } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { PlusCircle, FolderOpen, CheckCircle, Users, ArrowRight } from 'lucide-react';

export default function BrandDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalApplications = projects.reduce((acc, p) => acc + (p.application_count || 0), 0);

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Welcome Header */}
        <div className="page-header" style={{ marginBottom: 32 }}>
          <div>
            <h1 className="page-title">Welcome back, {user?.name}! 👋</h1>
            <p className="page-subtitle">
              Manage your active advertisement campaigns and creator applications.
            </p>
          </div>
          <Link to="/brand/projects/create" className="btn btn-primary btn-lg">
            <PlusCircle size={20} />
            Create New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: 36 }}>
          {loading ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon blue">
                  <FolderOpen size={24} />
                </div>
                <div>
                  <div className="stat-value">{projects.length}</div>
                  <div className="stat-label">Total Projects</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <FolderOpen size={24} />
                </div>
                <div>
                  <div className="stat-value">{activeProjects.length}</div>
                  <div className="stat-label">Active Projects</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="stat-value">{completedProjects.length}</div>
                  <div className="stat-label">Completed Projects</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <Users size={24} />
                </div>
                <div>
                  <div className="stat-value">{totalApplications}</div>
                  <div className="stat-label">Total Applications</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Projects Section */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Projects</h2>
            {projects.length > 0 && (
              <Link to="/brand/projects" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                fontSize: 14,
              }}>
                View All <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects created yet"
              message="Post your first advertisement campaign to connect with talented creators."
              action={
                <Link to="/brand/projects/create" className="btn btn-primary">
                  <PlusCircle size={18} />
                  Create Your First Project
                </Link>
              }
            />
          ) : (
            <div className="grid-3 stagger">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  linkPrefix="/brand/projects"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

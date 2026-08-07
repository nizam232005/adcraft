import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { SkeletonGrid, SkeletonStat } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { Briefcase, FileText, CheckCircle, Clock, Search, ArrowRight } from 'lucide-react';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [openJobs, setOpenJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/projects/?limit=6'),
        api.get('/applications/my'),
      ]);
      setOpenJobs(jobsRes.data.projects || []);
      setMyApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to load creator dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const appliedCount = myApplications.length;
  const acceptedCount = myApplications.filter(a => a.status === 'accepted').length;
  const completedCount = myApplications.filter(a => a.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Welcome Header */}
        <div className="page-header" style={{ marginBottom: 32 }}>
          <div>
            <h1 className="page-title">Creator Dashboard 🎬</h1>
            <p className="page-subtitle">
              Browse brand requirements, submit proposals, and upload campaign deliverables.
            </p>
          </div>
          <Link to="/creator/jobs" className="btn btn-primary btn-lg">
            <Search size={20} />
            Browse Open Jobs
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
                  <Briefcase size={24} />
                </div>
                <div>
                  <div className="stat-value">{openJobs.length}</div>
                  <div className="stat-label">Available Jobs</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="stat-value">{appliedCount}</div>
                  <div className="stat-label">Applied Jobs</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="stat-value">{acceptedCount}</div>
                  <div className="stat-label">Accepted Jobs</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="stat-value">{completedCount}</div>
                  <div className="stat-label">Completed Jobs</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Latest Opportunities */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Latest Ad Campaigns</h2>
            {openJobs.length > 0 && (
              <Link to="/creator/jobs" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                fontSize: 14,
              }}>
                View All Jobs <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : openJobs.length === 0 ? (
            <EmptyState
              title="No open jobs right now"
              message="Check back soon! Brand owners post new campaign requirements frequently."
            />
          ) : (
            <div className="grid-3 stagger">
              {openJobs.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  linkPrefix="/creator/jobs"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

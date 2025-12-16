import React, { useEffect, useState } from "react";
import { applicationService, profileService, Application, JobSeekerProfile, Job } from "../api/services";

export default function JobSeekerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications
        const appsData = await applicationService.getMyApplications({ ordering: '-applied_at' });
        const appsList = appsData.results || appsData;
        setApplications(Array.isArray(appsList) ? appsList : []);

        // Fetch profile
        try {
          const profileData = await profileService.getJobSeekerProfile();
          const profileList = profileData.results || profileData;
          setProfile(Array.isArray(profileList) && profileList.length > 0 ? profileList[0] : null);
        } catch (profileErr) {
          console.log("No job seeker profile found");
        }

      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.detail || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    underReview: applications.filter(app => app.status === 'under_review').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
  };

  // Get user info from localStorage
  const userDataStr = localStorage.getItem('user');
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName || userData?.first_name || 'U';
    const last = lastName || userData?.last_name || 'S';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f3f6fb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f3f6fb'
      }}>
        <div style={{ 
          background: '#fff', 
          padding: 32, 
          borderRadius: 8,
          maxWidth: 400
        }}>
          <div style={{ color: '#d32f2f', marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
            Error
          </div>
          <div style={{ color: '#666' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f3f6fb", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Main content */}
      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 24, color: '#1a2e46' }}>
          Dashboard Overview
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24, marginBottom: 32 }}>
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Applications</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1a2e46" }}>{stats.totalApplications}</div>
          </div>
          
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Under Review</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ff9800" }}>{stats.underReview}</div>
          </div>
          
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Shortlisted</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#2196f3" }}>{stats.shortlisted}</div>
          </div>
          
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Accepted</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#4caf50" }}>{stats.accepted}</div>
          </div>
        </div>

        {/* Profile Card */}
        {profile && (
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 32,
            marginBottom: 32,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#5cb85c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 32,
                color: "#fff",
              }}>
                {getInitials(userData?.first_name, userData?.last_name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 24, color: "#1a2e46", marginBottom: 4 }}>
                  {userData?.first_name} {userData?.last_name}
                </div>
                <div style={{ color: "#666", fontSize: 16 }}>
                  {userData?.email}
                </div>
                {profile.bio && (
                  <div style={{ color: "#666", fontSize: 14, marginTop: 8 }}>
                    {profile.bio}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div style={{
          background: "#fff",
          borderRadius: 8,
          padding: 32,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24, color: '#1a2e46' }}>
            Recent Applications
          </div>
          
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>No applications yet</div>
              <div style={{ fontSize: 14 }}>Start applying to jobs to see them here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {applications.map((app: Application, idx: number) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    padding: 20,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#5cb85c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: 18,
                        color: "#1a2e46",
                        marginBottom: 8,
                      }}>
                        {app.job?.title || 'Job Title'}
                      </div>
                      <div style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>
                        {app.job?.company || 'Company Name'}
                      </div>
                      <div style={{ color: "#999", fontSize: 13 }}>
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      background: app.status === 'accepted' ? '#4caf50' :
                                 app.status === 'shortlisted' ? '#2196f3' :
                                 app.status === 'under_review' ? '#ff9800' : '#999',
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {app.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

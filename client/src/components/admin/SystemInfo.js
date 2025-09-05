import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axios';
import { FaServer, FaDatabase, FaMemory, FaClock } from 'react-icons/fa';

const SystemContainer = styled.div``;

const SystemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SystemCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.xl};
  border-left: 4px solid ${props => props.color || props.theme.colors.tealBlue};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CardIcon = styled.div`
  color: ${props => props.color || props.theme.colors.tealBlue};
  font-size: ${props => props.theme.fontSizes['2xl']};
`;

const CardTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.blackOlive};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  .label {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.davysGrey};
    margin-bottom: ${props => props.theme.spacing.xs};
    font-weight: ${props => props.theme.fontWeights.semibold};
  }
  
  .value {
    font-size: ${props => props.theme.fontSizes.base};
    color: ${props => props.theme.colors.blackOlive};
    font-weight: ${props => props.theme.fontWeights.medium};
  }
`;

const SingleInfoItem = styled.div`
  grid-column: 1 / -1;
  
  .label {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.davysGrey};
    margin-bottom: ${props => props.theme.spacing.xs};
    font-weight: ${props => props.theme.fontWeights.semibold};
  }
  
  .value {
    font-size: ${props => props.theme.fontSizes.base};
    color: ${props => props.theme.colors.blackOlive};
    font-weight: ${props => props.theme.fontWeights.medium};
  }
`;

const MemoryBar = styled.div`
  width: 100%;
  height: 20px;
  background: ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.base};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.xs};
`;

const MemoryFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.theme.colors.success}, ${props => props.theme.colors.warning});
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${props => props.theme.colors.lightGrey};
    border-top: 4px solid ${props => props.theme.colors.rackley};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;

const SystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemInfo();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await axios.get('/api/admin/system-info');
      setSystemInfo(response.data.system);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system info:', error);
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getMemoryUsagePercentage = (used, total) => {
    return ((used / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
      </LoadingSpinner>
    );
  }

  if (!systemInfo) {
    return <div>Failed to load system information</div>;
  }

  return (
    <SystemContainer>
      <SystemGrid>
        {/* Server Information */}
        <SystemCard color={props => props.theme.colors.tealBlue}>
          <CardHeader>
            <CardIcon color={props => props.theme.colors.tealBlue}>
              <FaServer />
            </CardIcon>
            <CardTitle>Server Information</CardTitle>
          </CardHeader>
          <InfoGrid>
            <InfoItem>
              <div className="label">Node.js Version</div>
              <div className="value">{systemInfo.nodeVersion}</div>
            </InfoItem>
            <InfoItem>
              <div className="label">Environment</div>
              <div className="value">{systemInfo.environment}</div>
            </InfoItem>
            <SingleInfoItem>
              <div className="label">Uptime</div>
              <div className="value">{formatUptime(systemInfo.uptime)}</div>
            </SingleInfoItem>
          </InfoGrid>
        </SystemCard>

        {/* Memory Usage */}
        <SystemCard color={props => props.theme.colors.rackley}>
          <CardHeader>
            <CardIcon color={props => props.theme.colors.rackley}>
              <FaMemory />
            </CardIcon>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <InfoGrid>
            <InfoItem>
              <div className="label">Heap Used</div>
              <div className="value">{formatBytes(systemInfo.memoryUsage.heapUsed)}</div>
            </InfoItem>
            <InfoItem>
              <div className="label">Heap Total</div>
              <div className="value">{formatBytes(systemInfo.memoryUsage.heapTotal)}</div>
            </InfoItem>
            <InfoItem>
              <div className="label">RSS</div>
              <div className="value">{formatBytes(systemInfo.memoryUsage.rss)}</div>
            </InfoItem>
            <InfoItem>
              <div className="label">External</div>
              <div className="value">{formatBytes(systemInfo.memoryUsage.external)}</div>
            </InfoItem>
          </InfoGrid>
          <MemoryBar>
            <MemoryFill 
              percentage={getMemoryUsagePercentage(
                systemInfo.memoryUsage.heapUsed, 
                systemInfo.memoryUsage.heapTotal
              )}
            />
          </MemoryBar>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '8px', 
            fontSize: '12px', 
            color: '#6c757d' 
          }}>
            {getMemoryUsagePercentage(
              systemInfo.memoryUsage.heapUsed, 
              systemInfo.memoryUsage.heapTotal
            )}% Used
          </div>
        </SystemCard>

        {/* Database Information */}
        <SystemCard color={props => props.theme.colors.airSuperiorityBlue}>
          <CardHeader>
            <CardIcon color={props => props.theme.colors.airSuperiorityBlue}>
              <FaDatabase />
            </CardIcon>
            <CardTitle>Database Information</CardTitle>
          </CardHeader>
          <InfoGrid>
            <InfoItem>
              <div className="label">Collections</div>
              <div className="value">{systemInfo.database?.collections || 'N/A'}</div>
            </InfoItem>
            <InfoItem>
              <div className="label">Data Size</div>
              <div className="value">{formatBytes(systemInfo.database?.dataSize || 0)}</div>
            </InfoItem>
            <SingleInfoItem>
              <div className="label">Storage Size</div>
              <div className="value">{formatBytes(systemInfo.database?.storageSize || 0)}</div>
            </SingleInfoItem>
          </InfoGrid>
        </SystemCard>

        {/* Performance Metrics */}
        <SystemCard color={props => props.theme.colors.darkSkyBlue}>
          <CardHeader>
            <CardIcon color={props => props.theme.colors.darkSkyBlue}>
              <FaClock />
            </CardIcon>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <InfoGrid>
            <SingleInfoItem>
              <div className="label">Last Updated</div>
              <div className="value">{new Date().toLocaleString()}</div>
            </SingleInfoItem>
            <InfoItem>
              <div className="label">Client Type</div>
              <div className="value">React App</div>
            </InfoItem>
            <InfoItem>
              <div className="label">User Agent</div>
              <div className="value">{navigator.userAgent?.split(' ')[0] || 'N/A'}</div>
            </InfoItem>
          </InfoGrid>
        </SystemCard>
      </SystemGrid>
    </SystemContainer>
  );
};

export default SystemInfo;

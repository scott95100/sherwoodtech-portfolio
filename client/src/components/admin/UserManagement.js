import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaTrash, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';

const UserManagementContainer = styled.div``;

const SearchSection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.mediumGrey};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};

  &:focus {
    border-color: ${props => props.theme.colors.rackley};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.rackley}20;
  }
`;

const SearchButton = styled.button`
  background: ${props => props.theme.colors.tealBlue};
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    background: ${props => props.theme.colors.rackley};
  }
`;

const UsersTable = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 2fr;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.lightGrey};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.davysGrey};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 2fr;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
  align-items: center;

  &:hover {
    background: ${props => props.theme.colors.lightGrey};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.blackOlive};
`;

const UserEmail = styled.div`
  color: ${props => props.theme.colors.davysGrey};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const UserRole = styled.span`
  background: ${props => props.role === 'admin' ? props.theme.colors.error : props.theme.colors.info};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  text-transform: uppercase;
`;

const StatusBadge = styled.span`
  background: ${props => props.active ? props.theme.colors.success : props.theme.colors.mediumGrey};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'danger' ? props.theme.colors.error : props.theme.colors.tealBlue};
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  font-size: ${props => props.theme.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c82333' : props.theme.colors.rackley};
  }

  &:disabled {
    background: ${props => props.theme.colors.mediumGrey};
    cursor: not-allowed;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const PaginationButton = styled.button`
  background: ${props => props.active ? props.theme.colors.tealBlue : props.theme.colors.white};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.tealBlue};
  border: 1px solid ${props => props.theme.colors.tealBlue};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.tealBlue};
    color: ${props => props.theme.colors.white};
  }

  &:disabled {
    background: ${props => props.theme.colors.lightGrey};
    color: ${props => props.theme.colors.mediumGrey};
    border-color: ${props => props.theme.colors.mediumGrey};
    cursor: not-allowed;
  }
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.put(`/api/admin/users/${userId}/toggle-status`);
      toast.success(response.data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to toggle user status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/api/admin/users/${userId}`);
        toast.success(response.data.message);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
      </LoadingSpinner>
    );
  }

  return (
    <UserManagementContainer>
      <SearchSection>
        <SearchInput
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <SearchButton onClick={handleSearch}>
          <FaSearch /> Search
        </SearchButton>
      </SearchSection>

      <UsersTable>
        <TableHeader>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Joined</div>
          <div>Actions</div>
        </TableHeader>

        {users.length > 0 ? (
          users.map(user => (
            <TableRow key={user._id}>
              <UserName>{user.name}</UserName>
              <UserEmail>{user.email}</UserEmail>
              <UserRole role={user.role}>{user.role}</UserRole>
              <StatusBadge active={user.isActive}>
                {user.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
              <div>{formatDate(user.createdAt)}</div>
              <ActionButtons>
                <ActionButton
                  onClick={() => toggleUserStatus(user._id)}
                  title={user.isActive ? 'Deactivate User' : 'Activate User'}
                >
                  {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => deleteUser(user._id)}
                  title="Delete User"
                >
                  <FaTrash />
                </ActionButton>
              </ActionButtons>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6c757d' }}>
              No users found
            </div>
          </TableRow>
        )}
      </UsersTable>

      {pagination.pages > 1 && (
        <Pagination>
          <PaginationButton
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>
          
          {[...Array(pagination.pages)].map((_, index) => (
            <PaginationButton
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </PaginationButton>
          ))}
          
          <PaginationButton
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
          >
            Next
          </PaginationButton>
        </Pagination>
      )}
    </UserManagementContainer>
  );
};

export default UserManagement;

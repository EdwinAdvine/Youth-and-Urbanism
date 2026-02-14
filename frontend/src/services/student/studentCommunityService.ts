/**
 * Student Community Service - Friends, Study Groups, Shoutouts
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/community';

/**
 * Send friend request
 */
export const sendFriendRequest = async (friendId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/friends/request`,
    { friend_id: friendId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (friendshipId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/friends/accept/${friendshipId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get friends
 */
export const getFriends = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/friends`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get friend requests
 */
export const getFriendRequests = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/friends/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Create study group
 */
export const createStudyGroup = async (data: {
  name: string;
  description?: string;
  subject?: string;
  max_members?: number;
}) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/study-groups`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Join study group
 */
export const joinStudyGroup = async (groupId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/study-groups/${groupId}/join`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get study groups
 */
export const getStudyGroups = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/study-groups`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Send shoutout
 */
export const sendShoutout = async (data: {
  to_student_id: string;
  message: string;
  category: 'encouragement' | 'help' | 'achievement' | 'thanks' | 'other';
  is_anonymous?: boolean;
}) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/shoutouts`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get shoutouts received
 */
export const getShoutoutsReceived = async (limit: number = 20) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/shoutouts/received?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get class wall
 */
export const getClassWall = async (limit: number = 50) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/class-wall?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get teacher Q&A threads
 */
export const getTeacherQAThreads = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/teacher-qa`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

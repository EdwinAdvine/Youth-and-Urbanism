/**
 * Student Community Service - Friends, Study Groups, Shoutouts
 */
import apiClient from '../api';

const API_PREFIX = '/api/v1/student/community';

/**
 * Send friend request
 */
export const sendFriendRequest = async (friendId: string) => {
  const response = await apiClient.post(`${API_PREFIX}/friends/request`, { friend_id: friendId });
  return response.data;
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (friendshipId: string) => {
  const response = await apiClient.post(`${API_PREFIX}/friends/accept/${friendshipId}`, {});
  return response.data;
};

/**
 * Get friends
 */
export const getFriends = async () => {
  const response = await apiClient.get(`${API_PREFIX}/friends`);
  return response.data;
};

/**
 * Get friend requests
 */
export const getFriendRequests = async () => {
  const response = await apiClient.get(`${API_PREFIX}/friends/requests`);
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
  const response = await apiClient.post(`${API_PREFIX}/study-groups`, data);
  return response.data;
};

/**
 * Join study group
 */
export const joinStudyGroup = async (groupId: string) => {
  const response = await apiClient.post(`${API_PREFIX}/study-groups/${groupId}/join`, {});
  return response.data;
};

/**
 * Get study groups
 */
export const getStudyGroups = async () => {
  const response = await apiClient.get(`${API_PREFIX}/study-groups`);
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
  const response = await apiClient.post(`${API_PREFIX}/shoutouts`, data);
  return response.data;
};

/**
 * Get shoutouts received
 */
export const getShoutoutsReceived = async (limit: number = 20) => {
  const response = await apiClient.get(`${API_PREFIX}/shoutouts/received`, { params: { limit } });
  return response.data;
};

/**
 * Get class wall
 */
export const getClassWall = async (limit: number = 50) => {
  const response = await apiClient.get(`${API_PREFIX}/class-wall`, { params: { limit } });
  return response.data;
};

/**
 * Reject friend request
 */
export const rejectFriendRequest = async (friendshipId: string) => {
  const response = await apiClient.post(`${API_PREFIX}/friends/reject/${friendshipId}`, {});
  return response.data;
};

/**
 * Get recent discussions
 */
export const getRecentDiscussions = async (limit: number = 20) => {
  const response = await apiClient.get(`${API_PREFIX}/discussions`, { params: { limit } });
  return response.data;
};

/**
 * Get classmates list (for shoutouts)
 */
export const getClassmates = async () => {
  const response = await apiClient.get(`${API_PREFIX}/classmates`);
  return response.data;
};

/**
 * Get teacher Q&A threads
 */
export const getTeacherQAThreads = async () => {
  const response = await apiClient.get(`${API_PREFIX}/teacher-qa`);
  return response.data;
};

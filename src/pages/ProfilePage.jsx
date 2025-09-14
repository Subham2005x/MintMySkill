import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import AvatarUpload from '../components/AvatarUpload';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null,
    skills: '',
    experience: '',
    education: '',
    website: '',
    linkedin: '',
    github: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || null,
        skills: user.profile?.skills?.join(', ') || '',
        experience: user.profile?.experience || '',
        education: user.profile?.education || '',
        website: user.profile?.socialLinks?.website || '',
        linkedin: user.profile?.socialLinks?.linkedin || '',
        github: user.profile?.socialLinks?.github || ''
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      setIsEditing(false);
      queryClient.invalidateQueries(['user']);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (result) => {
    setProfileData(prev => ({
      ...prev,
      avatar: {
        url: result.url,
        publicId: result.publicId
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatePayload = {
        name: profileData.name,
        profile: {
          bio: profileData.bio,
          avatar: profileData.avatar,
          skills: profileData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
          experience: profileData.experience,
          education: profileData.education,
          socialLinks: {
            website: profileData.website,
            linkedin: profileData.linkedin,
            github: profileData.github
          }
        }
      };

      await updateProfileMutation.mutateAsync(updatePayload);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information and preferences</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {isEditing ? (
              // Edit Form
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
                  <div className="flex items-center space-x-6">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar.url}
                        alt="Current avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <AvatarUpload
                        currentAvatar={profileData.avatar}
                        onUploadSuccess={handleAvatarUpload}
                        onUploadError={(error) => console.error('Avatar upload failed:', error)}
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="React, JavaScript, Node.js, Python"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <textarea
                      name="experience"
                      value={profileData.experience}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe your professional experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <textarea
                      name="education"
                      value={profileData.education}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your educational background..."
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={profileData.github}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-8">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-6">
                  {user.profile?.avatar ? (
                    <img
                      src={user.profile.avatar.url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                      <span className="text-sm text-gray-500">
                        Tokens: {user.wallet?.tokens || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user.profile?.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700">{user.profile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {user.profile?.skills?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {user.profile?.experience && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
                    <p className="text-gray-700 whitespace-pre-line">{user.profile.experience}</p>
                  </div>
                )}

                {/* Education */}
                {user.profile?.education && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
                    <p className="text-gray-700 whitespace-pre-line">{user.profile.education}</p>
                  </div>
                )}

                {/* Social Links */}
                {(user.profile?.socialLinks?.website || user.profile?.socialLinks?.linkedin || user.profile?.socialLinks?.github) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Links</h3>
                    <div className="flex space-x-4">
                      {user.profile.socialLinks.website && (
                        <a
                          href={user.profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          🌐 Website
                        </a>
                      )}
                      {user.profile.socialLinks.linkedin && (
                        <a
                          href={user.profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                      {user.profile.socialLinks.github && (
                        <a
                          href={user.profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          💻 GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
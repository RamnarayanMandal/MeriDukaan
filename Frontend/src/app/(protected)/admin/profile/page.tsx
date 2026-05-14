'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  ShieldCheck,
  Loader2,
  KeyRound,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetProfile, useUpdateProfile, useChangePassword } from '@/hooks/useAuth';
import { showSuccess, showError } from '@/lib/sweetAlert';
import { setAuthData, getUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function AdminProfilePage() {
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const currentUser = getUser();

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      });
    }
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileData, {
      onSuccess: (response) => {
        showSuccess('Profile updated successfully');
        
        // Update local storage to reflect changes across the app
        const token = localStorage.getItem('token');
        if (token && response.data?.user) {
          setAuthData(token, response.data.user);
          // Optional: trigger window reload to refresh all components if needed
          window.location.reload();
        }
      },
      onError: (error: any) => {
        showError(error.response?.data?.message || 'Failed to update profile');
      }
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showError('New passwords do not match');
    }

    changePassword.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }, {
      onSuccess: () => {
        showSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      },
      onError: (error: any) => {
        showError(error.response?.data?.message || 'Failed to change password');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900">Admin Account</h1>
        <p className="text-slate-500">Manage your administrative credentials and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-100">
                {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
              </div>
              <h3 className="font-bold text-lg text-slate-900">{profileData.firstName} {profileData.lastName}</h3>
              <p className="text-sm text-slate-500">{profileData.email}</p>
              <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Super Admin
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Password</span>
                <span className="text-green-600 font-bold">Secure</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Permissions</span>
                <span className="text-blue-600 font-bold">All Access</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Admin Profile
              </CardTitle>
              <CardDescription>Update your name and primary contact email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      value={profileData.firstName}
                      onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      value={profileData.lastName}
                      onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email"
                      disabled
                      value={profileData.email}
                      className="pl-10 bg-slate-50"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={updateProfile.isPending} className="bg-blue-600 hover:bg-blue-700">
                    {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Form */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-500" /> Security
              </CardTitle>
              <CardDescription>Change your administrative password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={changePassword.isPending} variant="destructive">
                    {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

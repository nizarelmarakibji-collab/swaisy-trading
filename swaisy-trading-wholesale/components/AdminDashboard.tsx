
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminDashboardProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (user: User) => void;
}

const UserModal: React.FC<{ 
    isOpen: boolean;
    onClose: () => void;
    user?: User; 
    onSave: (data: Partial<User>) => Promise<void>;
}> = ({ isOpen, onClose, user, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Partial<User>>({
        username: '',
        password: '',
        role: 'salesman',
        storeName: '',
        phoneNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        } else {
            setFormData({
                username: '',
                password: '',
                role: 'salesman',
                storeName: '',
                phoneNumber: '',
                address: ''
            });
        }
        setError('');
    }, [user, isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('Username and password are required');
            return;
        }
        
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">{user ? 'Edit User' : t('createUser')}</h3>
                    <button onClick={onClose}><XIcon className="h-6 w-6 text-slate-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('username')}</label>
                        <Input 
                            value={formData.username} 
                            onChange={e => handleChange('username', e.target.value)} 
                            disabled={!!user} // Cannot change username for existing
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                        <Input 
                            type="text"
                            value={formData.password} 
                            onChange={e => handleChange('password', e.target.value)} 
                            placeholder={user ? "Enter new password" : "Password"}
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">{t('role')}</label>
                         <select 
                            value={formData.role}
                            onChange={e => handleChange('role', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-sm"
                        >
                            <option value="salesman">Salesman</option>
                            <option value="shop">Shop</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Shop Specific Fields */}
                    {formData.role === 'shop' && (
                        <div className="space-y-3 pt-2 border-t mt-2">
                            <p className="text-xs font-bold text-slate-500 uppercase">Shop Details</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('storeName')}</label>
                                <Input 
                                    value={formData.storeName || ''} 
                                    onChange={e => handleChange('storeName', e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneNumber')}</label>
                                <Input 
                                    value={formData.phoneNumber || ''} 
                                    onChange={e => handleChange('phoneNumber', e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('address')}</label>
                                <Input 
                                    value={formData.address || ''} 
                                    onChange={e => handleChange('address', e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
                        <Button type="submit" disabled={loading}>{t('save')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, currentUser, onAddUser, onDeleteUser, onUpdateUser }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const handleOpenAdd = () => {
      setEditingUser(undefined);
      setIsModalOpen(true);
  }

  const handleOpenEdit = (user: User) => {
      setEditingUser(user);
      setIsModalOpen(true);
  }

  const handleSaveUser = async (data: Partial<User>) => {
      if (editingUser) {
          // Update
          onUpdateUser({ ...editingUser, ...data, id: editingUser.id });
      } else {
          // Add
          await onAddUser(data);
      }
  };

  const confirmDeleteUser = (userId: string) => {
    if (window.confirm(t('deleteUserConfirm'))) {
        onDeleteUser(userId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={editingUser} 
        onSave={handleSaveUser}
      />

      <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('userManagement')}</h3>
            <Button onClick={handleOpenAdd} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('addNewSalesman')}
            </Button>
        </div>

        <div className="mb-6">
          <div className="max-h-[500px] overflow-y-auto rounded-md border bg-slate-50 p-2 space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-3 bg-white rounded-md shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                            {user.username}
                            {user.id === currentUser.id && <span className="text-xs text-slate-400 font-normal">(You)</span>}
                        </div>
                        <div className="text-xs text-slate-500">Password: {user.password}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        user.role === 'editor' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                        user.role === 'shop' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                        {user.role}
                    </span>
                    {user.role === 'shop' && (
                        <div className="hidden md:block text-[10px] text-slate-400 text-right leading-tight">
                            <div>{user.storeName}</div>
                            <div>{user.phoneNumber}</div>
                        </div>
                    )}
                    <div className="flex items-center border-l pl-2 ml-1">
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-slate-600" onClick={() => handleOpenEdit(user)} title={t('edit')}>
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                        {user.id !== currentUser.id && (
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-100" onClick={() => confirmDeleteUser(user.id)} title={t('delete')}>
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, Role, Question, SystemPopup, ThemeConfig } from '../types';
import { INITIAL_QUESTIONS, THAI_REGIONS, BANNED_WORDS, AI_PRESETS } from '../constants';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  register: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (newProfile: Profile) => void;
  usersList: Profile[]; 
  banUser: (id: string) => void;
  deleteUser: (id: string) => void;
  toggleLike: (targetProfileId: string) => void;
  
  // Voting
  questions: Question[];
  addQuestion: (text: string) => Promise<{status: 'approved' | 'rejected'}>;
  voteQuestion: (questionId: string) => void;
  
  // Admin Features
  popups: SystemPopup[];
  activePopup: SystemPopup | null;
  createPopup: (popup: SystemPopup) => void;
  togglePopup: (id: string) => void;
  deletePopup: (id: string) => void;
  closeActivePopup: () => void;
  
  // AI Stylist
  askAiStylist: () => ThemeConfig;
  
  simulateUsers: (count: number, province: string) => void;
  backupData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersList, setUsersList] = useState<Profile[]>([]); 
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [popups, setPopups] = useState<SystemPopup[]>([]);
  const [activePopup, setActivePopup] = useState<SystemPopup | null>(null);

  useEffect(() => {
    // Load data from "Permanent" storage (Mock SQL)
    const savedUser = localStorage.getItem('zeelink-user');
    const savedProfile = localStorage.getItem('zeelink-profile');
    const savedUsersList = localStorage.getItem('zeelink-users-db');
    const savedQuestions = localStorage.getItem('zeelink-questions');
    const savedPopups = localStorage.getItem('zeelink-popups');

    if (savedUsersList) {
      setUsersList(JSON.parse(savedUsersList));
    } else {
        // Init Mock Data
        const mockDb: Profile[] = [
            {
                id: 'mock1', userId: 'mock1', uid: '0220261', username: 'somchai', displayName: 'Somchai K.', 
                photoUrl: 'https://picsum.photos/200', bio: 'Coffee lover in Bangkok', tags: ['Foodie'],
                region: 'ภาคกลาง', province: 'กรุงเทพมหานคร', district: 'ปทุมวัน', subDistrict: 'รองเมือง', postalCode: '10330',
                showOnExplore: true, likes: 25, views: 102,
                themeConfig: { backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', fontFamily: 'Prompt', layout: 'minimal' },
                links: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            }
        ];
        setUsersList(mockDb);
        localStorage.setItem('zeelink-users-db', JSON.stringify(mockDb));
    }

    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedPopups) setPopups(JSON.parse(savedPopups));

    if (savedUser) {
        const u = JSON.parse(savedUser);
        if (!u.isBanned) {
            setUser(u);
            if (savedProfile) setProfile(JSON.parse(savedProfile));
        } else {
            localStorage.removeItem('zeelink-user');
            localStorage.removeItem('zeelink-profile');
        }
    }

    setIsLoading(false);
  }, []);

  const saveToDb = (newList: Profile[]) => {
      setUsersList(newList);
      localStorage.setItem('zeelink-users-db', JSON.stringify(newList));
  };

  const generateUID = (isBot: boolean, index: number) => {
      return isBot ? `0${index}` : `022026${index}`;
  };

  const checkPopups = () => {
      const active = popups.find(p => p.isActive);
      if (active) {
          setActivePopup(active);
      }
  };

  const login = async (email: string, pass: string, remember: boolean): Promise<boolean> => {
    // Admin Check
    if (email === 'zbcd1053@gmail.com' && pass === 'z025991244') {
        const adminUser: User = {
            id: 'admin-001', email: email, name: 'Admin', photoUrl: 'https://ui-avatars.com/api/?name=Admin',
            role: 'admin', isBanned: false, lastLogin: new Date().toISOString()
        };
        setUser(adminUser);
        if (remember) localStorage.setItem('zeelink-user', JSON.stringify(adminUser));
        checkPopups();
        return true;
    }

    // Regular User
    if (email.includes('@')) {
        const userId = btoa(email); 
        const mockUser: User = {
            id: userId, email: email, name: email.split('@')[0], photoUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}`,
            role: 'user', isBanned: false, lastLogin: new Date().toISOString()
        };
        
        const existingProfile = usersList.find(p => p.userId === userId);
        
        setUser(mockUser);
        if (remember) localStorage.setItem('zeelink-user', JSON.stringify(mockUser));
        if (existingProfile) {
            setProfile(existingProfile);
            if (remember) localStorage.setItem('zeelink-profile', JSON.stringify(existingProfile));
        }
        checkPopups();
        return true;
    }
    return false;
  };

  const register = async (email: string, pass: string, name: string): Promise<boolean> => {
      const userId = btoa(email);
      const newUser: User = {
          id: userId, email, name, photoUrl: `https://ui-avatars.com/api/?name=${name}`,
          role: 'user', isBanned: false, lastLogin: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem('zeelink-user', JSON.stringify(newUser));
      checkPopups();
      return true;
    };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('zeelink-user');
    localStorage.removeItem('zeelink-profile');
  };

  const updateProfile = (newProfile: Profile) => {
    // Generate UID for new users
    if (!newProfile.uid || newProfile.uid.length < 5) {
        const realUserCount = usersList.filter(u => u.uid.startsWith('022026')).length;
        newProfile.uid = generateUID(false, realUserCount + 1);
    }
    newProfile.updatedAt = new Date().toISOString();

    setProfile(newProfile);
    localStorage.setItem('zeelink-profile', JSON.stringify(newProfile));
    
    // Update "DB"
    const updatedList = usersList.filter(p => p.id !== newProfile.id);
    updatedList.push(newProfile);
    saveToDb(updatedList);
  };

  const banUser = (id: string) => {
      alert(`ดำเนินการแบน User ID #${id} เรียบร้อยแล้ว`);
      const updatedList = usersList.filter(u => u.id !== id);
      saveToDb(updatedList);
  };

  const deleteUser = (id: string) => {
      const updatedList = usersList.filter(u => u.id !== id);
      saveToDb(updatedList);
      alert(`ลบผู้ใช้ ID #${id} เรียบร้อยแล้ว`);
  };

  const toggleLike = (targetProfileId: string) => {
      // Allow liking without login for visitor mode, but better to track
      const target = usersList.find(p => p.id === targetProfileId);
      if (target) {
          const updatedProfile = { ...target, likes: (target.likes || 0) + 1 };
          const updatedList = usersList.map(p => p.id === targetProfileId ? updatedProfile : p);
          saveToDb(updatedList);
          
          if (profile && profile.id === targetProfileId) {
             setProfile(updatedProfile); 
          }
      }
  };

  const addQuestion = async (text: string): Promise<{status: 'approved' | 'rejected'}> => {
      if (!user) return { status: 'rejected' };
      const containsBadWord = BANNED_WORDS.some(bad => text.toLowerCase().includes(bad));
      const status = containsBadWord ? 'rejected' : 'approved';

      const newQ: Question = {
          id: Date.now().toString(), userId: user.id, username: user.name, text, votes: 0,
          createdAt: new Date().toISOString(), votedUserIds: [], status: status
      };
      
      const newQuestions = [newQ, ...questions];
      setQuestions(newQuestions);
      localStorage.setItem('zeelink-questions', JSON.stringify(newQuestions));
      return { status };
  };

  const voteQuestion = (questionId: string) => {
      if (!user) return;
      const q = questions.find(q => q.id === questionId);
      if (!q || q.votedUserIds.includes(user.id)) return;

      const updatedQ = {
          ...q, votes: q.votes + 1, votedUserIds: [...q.votedUserIds, user.id]
      };
      
      const newQuestions = questions.map(qs => qs.id === questionId ? updatedQ : qs);
      setQuestions(newQuestions);
      localStorage.setItem('zeelink-questions', JSON.stringify(newQuestions));
  };

  // Popup Management
  const createPopup = (popup: SystemPopup) => {
      const newPopups = [...popups, popup];
      setPopups(newPopups);
      localStorage.setItem('zeelink-popups', JSON.stringify(newPopups));
  };

  const togglePopup = (id: string) => {
      const newPopups = popups.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
      setPopups(newPopups);
      localStorage.setItem('zeelink-popups', JSON.stringify(newPopups));
  };

  const deletePopup = (id: string) => {
      const newPopups = popups.filter(p => p.id !== id);
      setPopups(newPopups);
      localStorage.setItem('zeelink-popups', JSON.stringify(newPopups));
  };

  const closeActivePopup = () => setActivePopup(null);

  // AI Stylist
  const askAiStylist = (): ThemeConfig => {
      // "Zee" picks a random preset for now
      const randomPreset = AI_PRESETS[Math.floor(Math.random() * AI_PRESETS.length)];
      return {
          backgroundColor: randomPreset.bg,
          textColor: randomPreset.text,
          buttonColor: randomPreset.btn,
          fontFamily: 'Prompt',
          layout: randomPreset.glass ? 'glass' : 'modern',
          enableGlassEffect: randomPreset.glass
      };
  };

  const simulateUsers = (count: number, province: string) => {
      const newUsers: Profile[] = [];
      const regionData = THAI_REGIONS.find(r => r.provinces.some(p => p.name === province));
      const region = regionData ? regionData.name : 'Unknown';
      const existingBots = usersList.filter(u => u.uid.startsWith('0') && u.uid.length < 5).length;

      for (let i = 0; i < count; i++) {
          newUsers.push({
              id: `sim-${Date.now()}-${i}`, userId: `sim-user-${i}`, uid: generateUID(true, existingBots + i + 1),
              username: `user_${Math.random().toString(36).substr(2, 5)}`, displayName: `User ${existingBots + i + 1}`,
              photoUrl: `https://picsum.photos/seed/${i + Date.now()}/200`, bio: 'Simulated User', tags: [],
              region, province, district: 'เมือง', subDistrict: 'ในเมือง', postalCode: '00000',
              showOnExplore: true, likes: Math.floor(Math.random() * 50), views: Math.floor(Math.random() * 100),
              themeConfig: { backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', fontFamily: 'Prompt', layout: 'minimal' },
              links: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          });
      }
      const updatedList = [...usersList, ...newUsers];
      saveToDb(updatedList);
  };

  const backupData = () => {
      const data = { users: usersList, questions, popups, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zeelink-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <AuthContext.Provider value={{ 
        user, profile, isLoading, login, register, logout, updateProfile, usersList, banUser, deleteUser, toggleLike,
        questions, addQuestion, voteQuestion,
        popups, activePopup, createPopup, togglePopup, deletePopup, closeActivePopup,
        askAiStylist, simulateUsers, backupData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

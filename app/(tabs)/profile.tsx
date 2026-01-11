import { View, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { router } from 'expo-router';
import { AppHeader } from '@/components/ui/app-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { User, Mail, Calendar, MapPin, Heart, Bell, LogOut, TrendingUp, Award, Edit } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

const INTEREST_CATEGORIES = [
  { id: 'tech', label: 'Technologie', icon: '💻', color: '#3B82F6' },
  { id: 'sports', label: 'Sport', icon: '⚽', color: '#10B981' },
  { id: 'fashion', label: 'Mode', icon: '👗', color: '#EC4899' },
  { id: 'food', label: 'Essen & Trinken', icon: '🍕', color: '#F59E0B' },
  { id: 'travel', label: 'Reisen', icon: '✈️', color: '#06B6D4' },
  { id: 'music', label: 'Musik', icon: '🎵', color: '#8B5CF6' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#EF4444' },
  { id: 'fitness', label: 'Fitness & Gesundheit', icon: '💪', color: '#14B8A6' },
  { id: 'movies', label: 'Filme & Serien', icon: '🎬', color: '#6366F1' },
  { id: 'books', label: 'Bücher', icon: '📚', color: '#A855F7' },
  { id: 'art', label: 'Kunst & Design', icon: '🎨', color: '#F97316' },
  { id: 'cars', label: 'Autos', icon: '🚗', color: '#64748B' },
  { id: 'photography', label: 'Fotografie', icon: '📷', color: '#EC4899' },
  { id: 'cooking', label: 'Kochen', icon: '👨‍🍳', color: '#F59E0B' },
  { id: 'nature', label: 'Natur', icon: '🌲', color: '#10B981' },
  { id: 'pets', label: 'Haustiere', icon: '🐕', color: '#F97316' },
  { id: 'science', label: 'Wissenschaft', icon: '🔬', color: '#3B82F6' },
  { id: 'business', label: 'Business', icon: '💼', color: '#6366F1' },
];

const UserIcon = iconWithClassName(User);
const MailIcon = iconWithClassName(Mail);
const CalendarIcon = iconWithClassName(Calendar);
const MapPinIcon = iconWithClassName(MapPin);
const HeartIcon = iconWithClassName(Heart);
const BellIcon = iconWithClassName(Bell);
const LogOutIcon = iconWithClassName(LogOut);
const TrendingUpIcon = iconWithClassName(TrendingUp);
const AwardIcon = iconWithClassName(Award);
const EditIcon = iconWithClassName(Edit);

export default function ProfileScreen() {
  const { user, logout, updateUser, refreshUser } = useAuth();
  const { stats } = useProfile();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Calculate header height: safe area top + logo container (44) + padding bottom (12)
  const headerHeight = insets.top + 44 + 12;
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [editInterestsDialogOpen, setEditInterestsDialogOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [savingInterests, setSavingInterests] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (user?.name) {
      setEditingName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    if (user?.interests) {
      setSelectedInterests(user.interests);
    }
  }, [user?.interests]);

  const handleSaveName = async () => {
    if (!editingName.trim()) {
      showToast('Bitte geben Sie einen Namen ein', 'error', 3000);
      return;
    }

    if (editingName.trim() === user?.name) {
      setEditNameDialogOpen(false);
      return;
    }

    setSavingName(true);
    try {
      await updateUser({ name: editingName.trim() });
      await refreshUser(); // Refresh to get updated user data
      showToast('✓ Name erfolgreich aktualisiert', 'success', 2000);
      setEditNameDialogOpen(false);
    } catch (error) {
      console.error('Error updating name:', error);
      showToast('Fehler beim Aktualisieren des Namens', 'error', 3000);
    } finally {
      setSavingName(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) {
      showToast('Bitte wählen Sie mindestens ein Interesse aus', 'error', 3000);
      return;
    }

    setSavingInterests(true);
    try {
      await updateUser({
        interests: selectedInterests,
      });
      await refreshUser();
      showToast(`✓ ${selectedInterests.length} Interessen erfolgreich aktualisiert`, 'success', 2000);
      setEditInterestsDialogOpen(false);
    } catch (error) {
      console.error('Error updating interests:', error);
      showToast('Fehler beim Aktualisieren der Interessen', 'error', 3000);
    } finally {
      setSavingInterests(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(onboarding)/welcome');
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      <AppHeader />
      <Animated.View 
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="mb-6">
            <Text variant="h1" className="mb-2 font-bold text-white">
              Profil
            </Text>
            <Text variant="small" className="text-gray-400">
              Ihre persönlichen Informationen
            </Text>
          </View>

        {/* Profile Header */}
        <View className="items-center mb-6">
          <UserAvatar
            userId={user?.id || 'default'}
            name={user?.name}
            size={96}
            style="robots"
            customUrl={user?.avatarUrl}
            showBorder={true}
            borderColor="#8B5CF6"
            className="mb-3 shadow-lg"
          />
          <Text variant="h2" className="font-bold mb-1 text-white">
            {user?.name || 'Nutzer'}
          </Text>
          <Text variant="small" className="text-muted-foreground">
            {user?.email || ''}
          </Text>
          <Text variant="small" className="text-purple-400 mt-1">
            🤖 RoboHash Avatar
          </Text>
        </View>

        {/* Personal Information Card */}
        <Card className="mb-4 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-500" />
                <Text variant="h3" className="text-blue-400 font-semibold">
                  Persönliche Informationen
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                <UserIcon className="w-4 h-4 text-blue-400" />
              </View>
              <View className="flex-1">
                <Text variant="small" className="text-gray-400 mb-0.5">
                  Name
                </Text>
                <Text variant="p" className="font-medium text-white">{user?.name || '-'}</Text>
              </View>
              <Dialog open={editNameDialogOpen} onOpenChange={setEditNameDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onPress={() => {
                      setEditingName(user?.name || '');
                      setEditNameDialogOpen(true);
                    }}
                  >
                    <EditIcon className="w-4 h-4 text-blue-400" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      <Text variant="h3">Namen ändern</Text>
                    </DialogTitle>
                  </DialogHeader>
                  <View className="gap-4 mt-4">
                    <View>
                      <Label>
                        <Text>Name</Text>
                      </Label>
                      <Input
                        placeholder="Ihr Name"
                        value={editingName}
                        onChangeText={setEditingName}
                        autoCapitalize="words"
                        className="mt-2"
                        autoFocus
                      />
                    </View>
                  </View>
                  <DialogFooter>
                    <View className="flex-row gap-2 w-full">
                      <Button
                        variant="outline"
                        onPress={() => {
                          setEditNameDialogOpen(false);
                          setEditingName(user?.name || '');
                        }}
                        className="flex-1"
                        disabled={savingName}
                      >
                        <Text>Abbrechen</Text>
                      </Button>
                      <Button
                        onPress={handleSaveName}
                        className="flex-1"
                        disabled={savingName || !editingName.trim()}
                      >
                        <Text>{savingName ? 'Wird gespeichert...' : 'Speichern'}</Text>
                      </Button>
                    </View>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </View>
            <View className="flex-row items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                <MailIcon className="w-4 h-4 text-blue-400" />
              </View>
              <View className="flex-1">
                <Text variant="small" className="text-gray-400 mb-0.5">
                  E-Mail
                </Text>
                <Text variant="p" className="font-medium text-white">{user?.email || '-'}</Text>
              </View>
            </View>
            {user?.demographics && (
              <>
                {user.demographics.age > 0 && (
                  <View className="flex-row items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                      <CalendarIcon className="w-4 h-4 text-blue-400" />
                    </View>
                    <View className="flex-1">
                      <Text variant="small" className="text-gray-400 mb-0.5">
                        Alter
                      </Text>
                      <Text variant="p" className="font-medium text-white">{user.demographics.age} Jahre</Text>
                    </View>
                  </View>
                )}
                {user.demographics.location && (
                  <View className="flex-row items-center gap-3 py-2">
                    <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                      <MapPinIcon className="w-4 h-4 text-blue-400" />
                    </View>
                    <View className="flex-1">
                      <Text variant="small" className="text-gray-400 mb-0.5">
                        Standort
                      </Text>
                      <Text variant="p" className="font-medium text-white">
                        {user.demographics.location}
                        {user.demographics.country && `, ${user.demographics.country}`}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Interests Card */}
        <Card className="mb-4 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <HeartIcon className="w-4 h-4 text-pink-500" />
                  <Text variant="h3" className="text-pink-400 font-semibold">
                    Interessen
                  </Text>
                </View>
                <Sheet open={editInterestsDialogOpen} onOpenChange={setEditInterestsDialogOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      onPress={() => {
                        setSelectedInterests(user?.interests || []);
                        setEditInterestsDialogOpen(true);
                      }}
                    >
                      <EditIcon className="w-4 h-4 text-pink-400" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    snapPoints={[windowHeight - headerHeight]}
                    topInset={headerHeight}
                    className="px-6"
                    hideCloseButton={false}
                  >
                    <SheetHeader>
                      <SheetTitle>
                        <Text variant="h2" className="text-foreground font-bold">
                          Interessen bearbeiten
                        </Text>
                      </SheetTitle>
                      <Text variant="small" className="text-muted-foreground mt-2">
                        Wählen Sie Ihre Interessen für personalisierte Werbung
                      </Text>
                    </SheetHeader>
                    <ScrollView 
                      className="flex-1 mt-6"
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ paddingBottom: 24 }}
                    >
                      <View className="flex-row flex-wrap gap-3">
                        {INTEREST_CATEGORIES.map((category) => {
                          const isSelected = selectedInterests.includes(category.id);
                          return (
                            <Pressable
                              key={category.id}
                              onPress={() => toggleInterest(category.id)}
                              style={{
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderRadius: 20,
                                backgroundColor: isSelected ? category.color : 'rgba(236, 72, 153, 0.1)',
                                borderWidth: 2,
                                borderColor: isSelected ? category.color : 'rgba(236, 72, 153, 0.3)',
                                minWidth: 100,
                              }}
                            >
                              <View className="flex-row items-center gap-2">
                                <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                                <Text 
                                  variant="small" 
                                  className="font-medium"
                                  style={{ color: isSelected ? '#FFFFFF' : '#EC4899' }}
                                >
                                  {category.label}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                      {selectedInterests.length > 0 && (
                        <View className="mt-6 px-4 py-3 rounded-full self-center bg-primary/10">
                          <Text variant="small" className="text-primary font-semibold text-center">
                            {selectedInterests.length} {selectedInterests.length === 1 ? 'Interesse' : 'Interessen'} ausgewählt
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                    <View className="flex-row gap-3 pt-4 pb-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <Button
                        variant="outline"
                        onPress={() => {
                          setEditInterestsDialogOpen(false);
                          setSelectedInterests(user?.interests || []);
                        }}
                        className="flex-1"
                        disabled={savingInterests}
                      >
                        <Text>Abbrechen</Text>
                      </Button>
                      <Button
                        onPress={handleSaveInterests}
                        className="flex-1"
                        disabled={savingInterests || selectedInterests.length === 0}
                      >
                        <Text>{savingInterests ? 'Wird gespeichert...' : 'Speichern'}</Text>
                      </Button>
                    </View>
                  </SheetContent>
                </Sheet>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.interests && user.interests.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {user.interests.map((interest) => {
                  const category = INTEREST_CATEGORIES.find(cat => cat.id === interest);
                  return (
                    <View
                      key={interest}
                      className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                      style={{
                        backgroundColor: category ? `${category.color}20` : 'rgba(236, 72, 153, 0.1)',
                        borderWidth: 1,
                        borderColor: category ? `${category.color}50` : 'rgba(236, 72, 153, 0.3)',
                      }}
                    >
                      {category && <Text>{category.icon}</Text>}
                      <Text variant="small" className="text-pink-300 font-medium">
                        {category ? category.label : interest}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="py-4 items-center">
                <Text className="text-4xl mb-2">💭</Text>
                <Text variant="p" className="text-gray-400 text-center">
                  Keine Interessen ausgewählt
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="mb-4 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-purple-500" />
                <Text variant="h3" className="text-purple-400 font-semibold">
                  Statistiken
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            {stats.loading ? (
              <View className="py-4 items-center">
                <Text variant="p" className="text-gray-400">
                  Lade Statistiken...
                </Text>
              </View>
            ) : (
              <>
                {/* Guthaben */}
                <View className="flex-row items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                  <View>
                    <Text variant="small" className="text-gray-400 mb-1">
                      Aktuelles Guthaben
                    </Text>
                    <Text variant="h2" className="text-purple-400 font-bold">
                      {formatCurrency(stats.totalBalance)}
                    </Text>
                  </View>
                  <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                    <TrendingUpIcon className="w-6 h-6 text-purple-400" />
                  </View>
                </View>

                {/* Kampagnen */}
                <View className="flex-row gap-3">
                  <View className="flex-1 p-3 rounded-lg border" style={{ borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                        <Text className="text-purple-400 font-bold">👁️</Text>
                      </View>
                    </View>
                    <Text variant="small" className="text-gray-400 mb-1">
                      Gesehen
                    </Text>
                    <Text variant="h3" className="text-white font-bold">
                      {stats.totalCampaigns}
                    </Text>
                  </View>
                  <View className="flex-1 p-3 rounded-lg border" style={{ borderColor: 'rgba(34, 197, 94, 0.2)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                        <AwardIcon className="w-4 h-4 text-green-400" />
                      </View>
                    </View>
                    <Text variant="small" className="text-gray-400 mb-1">
                      Abgeschlossen
                    </Text>
                    <Text variant="h3" className="text-green-400 font-bold">
                      {stats.completedCampaigns}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="mb-4 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row items-center gap-2">
                <BellIcon className="w-4 h-4 text-green-500" />
                <Text variant="h3" className="text-green-400 font-semibold">
                  Einstellungen
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <BellIcon className="w-4 h-4 text-green-400" />
                </View>
                <Text variant="p" className="font-medium text-white">Push-Benachrichtigungen</Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{
                backgroundColor: user?.preferences.notificationsEnabled 
                  ? 'rgba(34, 197, 94, 0.1)' 
                  : 'rgba(107, 114, 128, 0.1)',
              }}>
                <Text variant="small" className="font-semibold" style={{
                  color: user?.preferences.notificationsEnabled 
                    ? '#22C55E' 
                    : '#6B7280',
                }}>
                  {user?.preferences.notificationsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          onPress={handleLogout} 
          className="mt-2"
          style={{
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center gap-2">
            <LogOutIcon className="w-4 h-4 text-white" />
            <Text className="font-semibold">Abmelden</Text>
          </View>
        </Button>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}



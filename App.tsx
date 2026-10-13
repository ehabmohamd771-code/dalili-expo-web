import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, StatusBar,
  Pressable, SafeAreaView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Report = {
  id: string;
  title: string;
  place: string;
  date: string;
  type: 'مفقود' | 'معثور عليه';
  category: string;
  description: string;
  contact?: string;
  eventDate?: string;
  icon: string;
  color: string;
  mine?: boolean;
};

type HomeItem = {
  id: string;
  name: string;
  place: string;
  description: string;
  updatedAt: string;
};

const categories = [
  { icon: '📱', name: 'إلكترونيات' },
  { icon: '🎒', name: 'حقائب' },
  { icon: '🪪', name: 'وثائق' },
  { icon: '🔑', name: 'مفاتيح' },
  { icon: '💍', name: 'مجوهرات' },
  { icon: '📦', name: 'أخرى' },
];

const initialReports: Report[] = [
  { id: '1', icon: '📱', title: 'هاتف محمول مفقود', place: 'بالقرب من الجامعة', date: 'اليوم', type: 'مفقود', category: 'إلكترونيات', description: '', color: '#FFF0E8' },
  { id: '2', icon: '🎒', title: 'حقيبة تم العثور عليها', place: 'في المعهد التقني', date: 'أمس', type: 'معثور عليه', category: 'حقائب', description: '', color: '#E7F7EF' },
  { id: '3', icon: '🪪', title: 'بطاقة شخصية', place: 'بالقرب من الكلية', date: 'منذ يومين', type: 'معثور عليه', category: 'وثائق', description: '', color: '#EAF1FF' },
];

export default function App() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('الكل');
  const [tab, setTab] = useState('الرئيسية');
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('أخرى');
  const [type, setType] = useState<'مفقود' | 'معثور عليه'>('مفقود');
  const [reportsLoaded, setReportsLoaded] = useState(false);

  const [homeItems, setHomeItems] = useState<HomeItem[]>([]);
  const [homeItemsLoaded, setHomeItemsLoaded] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPlace, setItemPlace] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        const saved = await AsyncStorage.getItem('@dalili/reports');

        if (active && saved !== null) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setReports(parsed);
          }
        }
      } catch (error) {
        console.warn('تعذر استعادة البلاغات المحفوظة:', error);
      } finally {
        if (active) {
          setReportsLoaded(true);
        }
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!reportsLoaded) return;

    AsyncStorage.setItem('@dalili/reports', JSON.stringify(reports))
      .catch((error) => {
        console.warn('تعذر حفظ البلاغات:', error);
      });
  }, [reports, reportsLoaded]);


  useEffect(() => {
    let active = true;

    const loadHomeItems = async () => {
      try {
        const saved = await AsyncStorage.getItem('@dalili/home-items');

        if (active && saved !== null) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setHomeItems(parsed as HomeItem[]);
          }
        }
      } catch (error) {
        console.warn('تعذر استعادة الأغراض المحفوظة:', error);
      } finally {
        if (active) setHomeItemsLoaded(true);
      }
    };

    loadHomeItems();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!homeItemsLoaded) return;

    AsyncStorage.setItem('@dalili/home-items', JSON.stringify(homeItems))
      .catch((error) => {
        console.warn('تعذر حفظ الأغراض:', error);
      });
  }, [homeItems, homeItemsLoaded]);

  const filteredReports = reports.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.place.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.contact || '').toLowerCase().includes(q) ||
      (item.eventDate || '').toLowerCase().includes(q);
    const matchesType =
      selected === 'الكل' ||
      (selected === 'المفقودات' && item.type === 'مفقود') ||
      (selected === 'المعثرات' && item.type === 'معثور عليه');
    return matchesSearch && matchesType;
  });

  const saveReport = () => {
    if (!title.trim() || !place.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال اسم الغرض ومكان فقدانه أو العثور عليه.');
      return;
    }
    const icons: Record<string, string> = {
      'إلكترونيات': '📱', 'حقائب': '🎒', 'وثائق': '🪪',
      'مفاتيح': '🔑', 'مجوهرات': '💍', 'أخرى': '📦'
    };
    const newReport: Report = {
      id: Date.now().toString(),
      title: title.trim(),
      place: place.trim(),
      description: description.trim(),
      contact: contact.trim(),
      eventDate: eventDate.trim(),
      category,
      type,
      date: 'الآن',
      icon: icons[category] || '📦',
      color: type === 'مفقود' ? '#FFF0E8' : '#E7F7EF',
      mine: true,
    };
    setReports((previous) => [newReport, ...previous]);
    setTitle('');
    setPlace('');
    setDescription('');
    setContact('');
    setEventDate('');
    setCategory('أخرى');
    setType('مفقود');
    setSelected('الكل');
    setTab('بلاغاتي');
    Alert.alert('تمت الإضافة', 'تم حفظ البلاغ على هذا الجهاز.');
  };

  const resetHomeItemForm = () => {
    setItemName('');
    setItemPlace('');
    setItemDescription('');
    setEditingItemId(null);
  };

  const saveHomeItem = () => {
    if (!itemName.trim() || !itemPlace.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال اسم الغرض ومكان وضعه.');
      return;
    }

    const now = new Date().toLocaleString();

    if (editingItemId) {
      setHomeItems((previous) =>
        previous.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: itemName.trim(),
                place: itemPlace.trim(),
                description: itemDescription.trim(),
                updatedAt: now,
              }
            : item
        )
      );
      Alert.alert('تم التحديث', 'تم تحديث بيانات الغرض.');
    } else {
      const newItem: HomeItem = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        name: itemName.trim(),
        place: itemPlace.trim(),
        description: itemDescription.trim(),
        updatedAt: now,
      };

      setHomeItems((previous) => [newItem, ...previous]);
      Alert.alert('تمت الإضافة', 'تم حفظ الغرض على هذا الجهاز.');
    }

    resetHomeItemForm();
  };

  const editHomeItem = (item: HomeItem) => {
    setItemName(item.name);
    setItemPlace(item.place);
    setItemDescription(item.description);
    setEditingItemId(item.id);
  };

  const deleteHomeItem = (id: string) => {
    setHomeItems((previous) => previous.filter((item) => item.id !== id));
    if (editingItemId === id) resetHomeItemForm();
  };

  const filteredHomeItems = homeItems.filter((item) => {
    const q = itemSearch.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.place.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const reportCard = (item: Report) => (
    <View style={styles.reportCard} key={item.id}>
      <View style={styles.reportInfo}>
        <View style={styles.reportTop}>
          <Text style={styles.reportDate}>{item.date}</Text>
          <Text style={[styles.badge, item.type === 'مفقود' ? styles.lostBadge : styles.foundBadge]}>
            {item.type}
          </Text>
        </View>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportPlace}>📍 {item.place}</Text>
        {!!item.eventDate && <Text style={styles.description}>📅 التاريخ: {item.eventDate}</Text>}
        {!!item.description && <Text style={styles.description}>التفاصيل: {item.description}</Text>}
        {!!item.contact && <Text style={styles.description}>📞 التواصل: {item.contact}</Text>}
        <Text style={styles.categoryLabel}>{item.category}</Text>
      </View>
      <View style={[styles.reportImage, { backgroundColor: item.color }]}>
        <Text style={styles.reportEmoji}>{item.icon}</Text>
      </View>
    </View>
  );

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    multiline = false
  ) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#929BAA"
        textAlign="right"
        multiline={multiline}
      />
    </View>
  );

  const homeScreen = (
    <>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>أهلًا بك في دليلي 👋</Text>
        <Text style={styles.welcomeText}>فقدت شيئًا؟ أو عثرت على شيء؟ نحن هنا للمساعدة.</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن غرض أو مكان..."
          placeholderTextColor="#929BAA"
          value={search}
          onChangeText={setSearch}
          textAlign="right"
          returnKeyType="search"
        />
        {!!search && <Pressable onPress={() => setSearch('')}><Text>✖️</Text></Pressable>}
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.actionButton, styles.lostButton]} onPress={() => { setType('مفقود'); setTab('إضافة بلاغ'); }}>
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionTitle}>أبحث عن مفقود</Text>
          <Text style={styles.actionSub}>أضف بلاغ فقدان</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.foundButton]} onPress={() => { setType('معثور عليه'); setTab('إضافة بلاغ'); }}>
          <Text style={styles.actionIcon}>🤝</Text>
          <Text style={styles.actionTitle}>عثرْت على غرض</Text>
          <Text style={styles.actionSub}>أضف بلاغ العثور</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.seeAll} onPress={() => { setSearch(''); setTab('الرئيسية'); }}>عرض الكل</Text>
        <Text style={styles.sectionTitle}>تصفح الأقسام</Text>
      </View>
      <View style={styles.categories}>
        {categories.map((item) => (
          <Pressable key={item.name} style={styles.category} onPress={() => setSearch(item.name)}>
            <View style={styles.categoryIcon}><Text style={styles.categoryEmoji}>{item.icon}</Text></View>
            <Text style={styles.categoryName}>{item.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.seeAll} onPress={() => { setSelected('الكل'); setSearch(''); }}>عرض الكل</Text>
        <Text style={styles.sectionTitle}>أحدث البلاغات</Text>
      </View>
      <View style={styles.filterRow}>
        {['الكل', 'المفقودات', 'المعثرات'].map((filter) => (
          <Pressable key={filter} onPress={() => setSelected(filter)} style={[styles.filter, selected === filter && styles.activeFilter]}>
            <Text style={[styles.filterText, selected === filter && styles.activeFilterText]}>{filter}</Text>
          </Pressable>
        ))}
      </View>
      {filteredReports.length ? filteredReports.map(reportCard) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔎</Text>
          <Text style={styles.emptyText}>لا توجد بلاغات مطابقة للبحث</Text>
        </View>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>معًا نعيد الأشياء إلى أصحابها ❤️</Text>
        <Text style={styles.footerText}>دليلي — لأن الأمانة تجمعنا</Text>
      </View>
    </>
  );

  const addScreen = (
    <View style={styles.panel}>
      <Text style={styles.screenTitle}>إضافة بلاغ جديد</Text>
      <Text style={styles.welcomeText}>أدخل معلومات الغرض ومكانه.</Text>
      <Text style={styles.fieldLabel}>نوع البلاغ</Text>
      <View style={styles.choiceRow}>
        {(['مفقود', 'معثور عليه'] as const).map((v) => (
          <Pressable key={v} style={[styles.choice, type === v && styles.choiceActive]} onPress={() => setType(v)}>
            <Text style={[styles.choiceText, type === v && styles.choiceTextActive]}>{v}</Text>
          </Pressable>
        ))}
      </View>
      {field('اسم الغرض *', title, setTitle, 'مثال: هاتف سامسونج')}
      <Text style={styles.fieldLabel}>القسم</Text>
      <View style={styles.categoryChoices}>
        {categories.map((c) => (
          <Pressable key={c.name} style={[styles.smallChoice, category === c.name && styles.choiceActive]} onPress={() => setCategory(c.name)}>
            <Text style={[styles.smallChoiceText, category === c.name && styles.choiceTextActive]}>{c.icon} {c.name}</Text>
          </Pressable>
        ))}
      </View>
      {field('المكان *', place, setPlace, 'أين فُقد أو عُثر على الغرض؟')}
      {field('تاريخ الفقد أو العثور', eventDate, setEventDate, 'مثال: 2026-10-12')}
      {field('رقم التواصل (اختياري)', contact, setContact, 'أدخل رقمًا للتواصل')}
      {field('تفاصيل إضافية', description, setDescription, 'اللون أو العلامات المميزة...', true)}
      <Pressable style={styles.primaryButton} onPress={saveReport}>
        <Text style={styles.primaryButtonText}>حفظ البلاغ</Text>
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={() => setTab('الرئيسية')}>
        <Text style={styles.cancelText}>إلغاء والعودة</Text>
      </Pressable>
    </View>
  );

  const myReportsScreen = (
    <View>
      <Text style={styles.screenTitle}>بلاغاتي</Text>
      <Text style={styles.welcomeText}>البلاغات التي أضفتها في هذه الجلسة.</Text>
      {reports.filter((r) => r.mine).length
        ? reports.filter((r) => r.mine).map(reportCard)
        : <View style={styles.empty}><Text style={styles.emptyIcon}>📋</Text><Text style={styles.emptyText}>لم تضف أي بلاغ بعد</Text><Pressable style={styles.primaryButton} onPress={() => setTab('إضافة بلاغ')}><Text style={styles.primaryButtonText}>إضافة أول بلاغ</Text></Pressable></View>}
    </View>
  );

  const myItemsScreen = (
    <View>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>📦 أغراضي الشخصية</Text>
        <Text style={styles.welcomeText}>
          سجّل مكان أغراضك لتتذكر أين وضعتها، وابحث عنها عندما تحتاج إليها.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.screenTitle}>
          {editingItemId ? 'تعديل الغرض' : 'إضافة غرض جديد'}
        </Text>

        {field('اسم الغرض *', itemName, setItemName, 'مثال: مفاتيح المنزل')}
        {field('مكان وضعه *', itemPlace, setItemPlace, 'مثال: الدرج العلوي')}
        {field('ملاحظات إضافية', itemDescription, setItemDescription, 'مثال: داخل العلبة الزرقاء', true)}

        <Pressable style={styles.primaryButton} onPress={saveHomeItem}>
          <Text style={styles.primaryButtonText}>
            {editingItemId ? 'حفظ التعديلات' : 'حفظ الغرض'}
          </Text>
        </Pressable>

        {editingItemId && (
          <Pressable style={styles.cancelButton} onPress={resetHomeItemForm}>
            <Text style={styles.cancelText}>إلغاء التعديل</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.screenTitle, { marginTop: 24 }]}>
        أغراضي المحفوظة ({homeItems.length})
      </Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          style={styles.searchInput}
          value={itemSearch}
          onChangeText={setItemSearch}
          placeholder="ابحث باسم الغرض أو مكانه..."
          placeholderTextColor="#929BAA"
          textAlign="right"
        />
      </View>

      {!homeItemsLoaded ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>جارٍ تحميل أغراضك...</Text>
        </View>
      ) : filteredHomeItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>
            {homeItems.length === 0
              ? 'لم تسجل أي أغراض بعد. أضف أول غرض من النموذج أعلاه.'
              : 'لا توجد أغراض تطابق البحث.'}
          </Text>
        </View>
      ) : (
        filteredHomeItems.map((item) => (
          <View style={styles.homeItemCard} key={item.id}>
            <Text style={styles.homeItemName}>📦 {item.name}</Text>
            <Text style={styles.homeItemPlace}>📍 مكانه: {item.place}</Text>
            {!!item.description && (
              <Text style={styles.description}>ملاحظات: {item.description}</Text>
            )}
            <Text style={styles.description}>آخر تحديث: {item.updatedAt}</Text>

            <View style={styles.homeItemActions}>
              <Pressable
                style={styles.itemEditButton}
                onPress={() => editHomeItem(item)}
              >
                <Text style={styles.itemActionText}>✏️ تعديل</Text>
              </Pressable>
              <Pressable
                style={styles.itemDeleteButton}
                onPress={() => {
                  const confirmed =
                    Platform.OS === 'web'
                      ? (typeof globalThis.confirm === 'function'
                          ? globalThis.confirm('هل تريد حذف هذا الغرض؟')
                          : true)
                      : true;
                  if (confirmed) deleteHomeItem(item.id);
                }}
              >
                <Text style={styles.itemActionText}>🗑️ حذف</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const accountScreen = (
    <View style={styles.panel}>
      <Text style={styles.screenTitle}>حسابي 👤</Text>
      <Text style={styles.welcomeText}>هذه نسخة تجريبية لا تتضمن تسجيل دخول حتى الآن.</Text>
      <View style={styles.accountBox}><Text style={styles.accountIcon}>📍</Text><Text style={styles.reportTitle}>مستخدم دليلي</Text><Text style={styles.welcomeText}>عدد البلاغات التي أضفتها: {reports.filter((r) => r.mine).length}</Text></View>
      <Pressable style={styles.primaryButton} onPress={() => setTab('إضافة بلاغ')}><Text style={styles.primaryButtonText}>إضافة بلاغ جديد</Text></Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoIcon}>📍</Text></View>
        <View style={styles.headerText}>
          <Text style={styles.appName}>دليلي</Text>
          <Text style={styles.subtitle}>دليلك للعثور على ما فقدت</Text>
        </View>
        <Pressable style={styles.notification} onPress={() => Alert.alert('التنبيهات', 'لا توجد تنبيهات جديدة.')}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {tab === 'الرئيسية' ? homeScreen : tab === 'إضافة بلاغ' ? addScreen : tab === 'بلاغاتي' ? myReportsScreen : tab === 'أغراضي' ? myItemsScreen : accountScreen}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', name: 'الرئيسية' },
          { icon: '📋', name: 'بلاغاتي' },
          { icon: '📦', name: 'أغراضي' },
          { icon: '➕', name: 'إضافة بلاغ' },
          { icon: '👤', name: 'حسابي' },
        ].map((item) => (
          <Pressable key={item.name} style={styles.navItem} onPress={() => setTab(item.name)}>
            <Text style={[styles.navIcon, tab === item.name && styles.navActive]}>{item.icon}</Text>
            <Text style={[styles.navText, tab === item.name && styles.navTextActive]}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  body: { flex: 1 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF' },
  logo: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E4F5EF', alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 25 },
  headerText: { flex: 1, marginRight: 12 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#173C35', textAlign: 'right' },
  subtitle: { fontSize: 12, color: '#75817F', textAlign: 'right', marginTop: 3 },
  notification: { padding: 10 },
  notificationIcon: { fontSize: 21 },
  content: { padding: 18, paddingBottom: 28 },
  welcome: { backgroundColor: '#E8F6F0', borderRadius: 20, padding: 20, marginBottom: 18 },
  welcomeTitle: { fontSize: 21, fontWeight: 'bold', color: '#173C35', textAlign: 'right', marginBottom: 8 },
  welcomeText: { fontSize: 14, color: '#66756F', textAlign: 'right', lineHeight: 23, marginBottom: 8 },
  searchBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, marginBottom: 18, borderWidth: 1, borderColor: '#E6EAF0' },
  searchIcon: { fontSize: 20, marginLeft: 10 },
  searchInput: { flex: 1, paddingVertical: 14, color: '#24332F', textAlign: 'right' },
  actionRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 24 },
  actionButton: { flex: 1, borderRadius: 16, padding: 14, minHeight: 132, justifyContent: 'center' },
  lostButton: { backgroundColor: '#FFF0E8' },
  foundButton: { backgroundColor: '#E7F7EF' },
  actionIcon: { fontSize: 25, textAlign: 'right', marginBottom: 7 },
  actionTitle: { fontSize: 15, fontWeight: 'bold', color: '#263B34', textAlign: 'right', marginBottom: 5 },
  actionSub: { fontSize: 11, color: '#66756F', textAlign: 'right' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#24332F' },
  seeAll: { color: '#16856A', fontSize: 13 },
  categories: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  category: { width: '31%', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, marginBottom: 10 },
  categoryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0F6F4', alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  categoryEmoji: { fontSize: 23 },
  categoryName: { fontSize: 12, color: '#344740', fontWeight: '600' },
  filterRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  filter: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  activeFilter: { backgroundColor: '#16856A' },
  filterText: { color: '#65716D', fontSize: 13 },
  activeFilterText: { color: '#FFFFFF', fontWeight: 'bold' },
  reportCard: { flexDirection: 'row-reverse', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EDF0F4' },
  reportInfo: { flex: 1, marginRight: 12 },
  reportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reportDate: { fontSize: 11, color: '#8A9490' },
  badge: { overflow: 'hidden', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: 'bold' },
  lostBadge: { backgroundColor: '#FFE8DD', color: '#B85428' },
  foundBadge: { backgroundColor: '#DDF5E8', color: '#16724F' },
  reportTitle: { fontSize: 15, fontWeight: 'bold', color: '#293A34', textAlign: 'right', marginBottom: 7 },
  reportPlace: { fontSize: 12, color: '#77827D', textAlign: 'right' },
  description: { fontSize: 12, color: '#69756F', textAlign: 'right', marginTop: 6 },
  categoryLabel: { fontSize: 11, color: '#16856A', textAlign: 'right', marginTop: 6 },
  reportImage: { width: 66, height: 66, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reportEmoji: { fontSize: 29 },
  empty: { alignItems: 'center', padding: 25, backgroundColor: '#FFFFFF', borderRadius: 16, marginVertical: 12 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: '#7D8984', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerTitle: { fontSize: 15, fontWeight: 'bold', color: '#356C5B', marginBottom: 7 },
  footerText: { fontSize: 12, color: '#89938F' },
  panel: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 18 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#173C35', textAlign: 'right', marginBottom: 12 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: 'bold', color: '#344740', textAlign: 'right', marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#DDE5E1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#24332F', backgroundColor: '#FBFCFD', textAlign: 'right' },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 18, marginTop: 8 },
  choice: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DDE5E1', alignItems: 'center' },
  choiceActive: { backgroundColor: '#16856A', borderColor: '#16856A' },
  choiceText: { color: '#52615B', fontWeight: '600' },
  choiceTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  categoryChoices: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7, marginBottom: 16, marginTop: 8 },
  smallChoice: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#DDE5E1' },
  smallChoiceText: { fontSize: 12, color: '#52615B' },
  primaryButton: { backgroundColor: '#16856A', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  cancelButton: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#75817F', fontSize: 14 },
  homeItemCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E3ECE7' },
  homeItemName: { fontSize: 17, fontWeight: 'bold', color: '#173C35', textAlign: 'right', marginBottom: 10 },
  homeItemPlace: { fontSize: 14, color: '#16856A', textAlign: 'right', marginBottom: 7 },
  homeItemActions: { flexDirection: 'row-reverse', gap: 10, marginTop: 12 },
  itemEditButton: { flex: 1, backgroundColor: '#E7F2FF', borderRadius: 10, padding: 11, alignItems: 'center' },
  itemDeleteButton: { flex: 1, backgroundColor: '#FFF0E8', borderRadius: 10, padding: 11, alignItems: 'center' },
  itemActionText: { color: '#344740', fontSize: 13, fontWeight: 'bold' },
  accountBox: { alignItems: 'center', backgroundColor: '#F4F8F6', borderRadius: 16, padding: 22, marginVertical: 16 },
  accountIcon: { fontSize: 40, marginBottom: 10 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 9 },
  bottomNav: { flexDirection: 'row-reverse', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E9EDEF', paddingHorizontal: 8, paddingBottom: 4 },
  navIcon: { fontSize: 20, opacity: 0.65 },
  navActive: { opacity: 1 },
  navText: { fontSize: 10, color: '#8A9490', marginTop: 4 },
  navTextActive: { color: '#16856A', fontWeight: 'bold' },
});

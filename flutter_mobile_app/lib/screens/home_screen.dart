import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/call_service.dart';
import '../services/notification_service.dart';
import 'package:intl/intl.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _recentCalls = [];
  Map<String, dynamic> _analytics = {};
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _initializeServices();
    _loadData();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  Future<void> _initializeServices() async {
    final callService = Provider.of<CallService>(context, listen: false);
    final notificationService = Provider.of<NotificationService>(context, listen: false);
    
    // Initialize notification service with call service
    await notificationService.initialize(callService);
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final callService = Provider.of<CallService>(context, listen: false);
      final recentCalls = await callService.getRecentCalls();
      final analytics = await callService.getCallAnalytics();
      
      setState(() {
        _recentCalls = recentCalls;
        _analytics = analytics;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _logout() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    await authService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'WeConnect CRM',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: const Color(0xFFDC2626),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                _logout();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: const [
                    Icon(Icons.person, size: 18),
                    SizedBox(width: 8),
                    Text('Profile'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'settings',
                child: Row(
                  children: const [
                    Icon(Icons.settings, size: 18),
                    SizedBox(width: 8),
                    Text('Settings'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: const [
                    Icon(Icons.logout, size: 18),
                    SizedBox(width: 8),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(
              icon: Icon(Icons.analytics),
              text: 'Analytics',
            ),
            Tab(
              icon: Icon(Icons.call_made),
              text: 'Recent Calls',
            ),
            Tab(
              icon: Icon(Icons.dialpad),
              text: 'Dialer',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAnalyticsTab(),
          _buildRecentCallsTab(),
          _buildDialerTab(),
        ],
      ),
    );
  }
  
  Widget _buildAnalyticsTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFFDC2626),
        ),
      );
    }
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stats Cards
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total Calls',
                  _analytics['totalCalls']?.toString() ?? '0',
                  Icons.call,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Answered',
                  _analytics['answeredCalls']?.toString() ?? '0',
                  Icons.call_received,
                  Colors.green,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Missed',
                  _analytics['missedCalls']?.toString() ?? '0',
                  Icons.call_missed,
                  Colors.red,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Answer Rate',
                  '${_analytics['answerRate'] ?? '0'}%',
                  Icons.trending_up,
                  Colors.orange,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Average Duration Card
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.purple[100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.timer,
                      color: Colors.purple[600],
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Average Call Duration',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDuration(_analytics['averageDuration'] ?? 0),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Call Status Distribution
          if (_analytics['callsByStatus'] != null) ...[
            const Text(
              'Call Status Distribution',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 16),
            ..._buildStatusDistribution(_analytics['callsByStatus']),
          ],
        ],
      ),
    );
  }
  
  Widget _buildRecentCallsTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFFDC2626),
        ),
      );
    }
    
    if (_recentCalls.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.call,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No recent calls',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your call history will appear here',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }
    
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFFDC2626),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _recentCalls.length,
        itemBuilder: (context, index) {
          final call = _recentCalls[index];
          return _buildCallLogItem(call);
        },
      ),
    );
  }
  
  Widget _buildDialerTab() {
    return const DialerWidget();
  }
  
  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 18,
                  ),
                ),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6B7280),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildCallLogItem(Map<String, dynamic> call) {
    final isOutbound = call['callType'] == 'OUTBOUND';
    final leadName = call['lead']?['firstName'] != null 
        ? '${call['lead']['firstName']} ${call['lead']['lastName']}'
        : 'Unknown';
    final phoneNumber = call['phoneNumber'] ?? '';
    final duration = call['duration'] != null ? _formatDuration(call['duration']) : 'N/A';
    final status = call['callStatus'] ?? 'UNKNOWN';
    final createdAt = DateTime.parse(call['createdAt']);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: isOutbound ? Colors.blue[100] : Colors.green[100],
            borderRadius: BorderRadius.circular(24),
          ),
          child: Icon(
            isOutbound ? Icons.call_made : Icons.call_received,
            color: isOutbound ? Colors.blue[600] : Colors.green[600],
            size: 24,
          ),
        ),
        title: Text(
          leadName,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              phoneNumber,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getStatusColor(status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    status.replaceAll('_', ' '),
                    style: TextStyle(
                      color: _getStatusColor(status),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  duration,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              DateFormat('MMM dd').format(createdAt),
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('HH:mm').format(createdAt),
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 11,
              ),
            ),
            const Spacer(),
            IconButton(
              icon: const Icon(Icons.call, size: 20),
              onPressed: () => _makeCall(phoneNumber),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
      ),
    );
  }
  
  List<Widget> _buildStatusDistribution(Map<String, dynamic> statusData) {
    return statusData.entries.map((entry) {
      final status = entry.key;
      final count = entry.value as int;
      final percentage = _analytics['totalCalls'] > 0 
          ? (count / _analytics['totalCalls'] * 100).toStringAsFixed(1)
          : '0.0';
      
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: _getStatusColor(status),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                status.replaceAll('_', ' '),
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF374151),
                ),
              ),
            ),
            Text(
              '$count ($percentage%)',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Color(0xFF1F2937),
              ),
            ),
          ],
        ),
      );
    }).toList();
  }
  
  Color _getStatusColor(String status) {
    switch (status) {
      case 'COMPLETED':
        return Colors.green;
      case 'ANSWERED':
        return Colors.blue;
      case 'FAILED':
      case 'NO_ANSWER':
      case 'BUSY':
        return Colors.red;
      case 'INITIATED':
      case 'RINGING':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }
  
  String _formatDuration(int seconds) {
    if (seconds == 0) return '0:00';
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
  }
  
  void _makeCall(String phoneNumber) {
    final callService = Provider.of<CallService>(context, listen: false);
    callService.makeCall(phoneNumber);
  }
}

// Dialer Widget
class DialerWidget extends StatefulWidget {
  const DialerWidget({Key? key}) : super(key: key);

  @override
  State<DialerWidget> createState() => _DialerWidgetState();
}

class _DialerWidgetState extends State<DialerWidget> {
  String _phoneNumber = '';

  void _addDigit(String digit) {
    setState(() {
      _phoneNumber += digit;
    });
  }

  void _removeDigit() {
    if (_phoneNumber.isNotEmpty) {
      setState(() {
        _phoneNumber = _phoneNumber.substring(0, _phoneNumber.length - 1);
      });
    }
  }

  void _makeCall() {
    if (_phoneNumber.isNotEmpty) {
      final callService = Provider.of<CallService>(context, listen: false);
      callService.makeCall(_phoneNumber);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Phone number display
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Text(
              _phoneNumber.isEmpty ? 'Enter number' : _phoneNumber,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w300,
                color: _phoneNumber.isEmpty ? Colors.grey[500] : Colors.black,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Dialer grid
          Expanded(
            child: GridView.count(
              crossAxisCount: 3,
              crossAxisSpacing: 24,
              mainAxisSpacing: 24,
              shrinkWrap: true,
              children: [
                _buildDialButton('1', ''),
                _buildDialButton('2', 'ABC'),
                _buildDialButton('3', 'DEF'),
                _buildDialButton('4', 'GHI'),
                _buildDialButton('5', 'JKL'),
                _buildDialButton('6', 'MNO'),
                _buildDialButton('7', 'PQRS'),
                _buildDialButton('8', 'TUV'),
                _buildDialButton('9', 'WXYZ'),
                _buildDialButton('*', ''),
                _buildDialButton('0', '+'),
                _buildDialButton('#', ''),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Action buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Backspace button
              GestureDetector(
                onTap: _removeDigit,
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: const Icon(
                    Icons.backspace_outlined,
                    color: Colors.grey,
                  ),
                ),
              ),
              
              // Call button
              GestureDetector(
                onTap: _phoneNumber.isNotEmpty ? _makeCall : null,
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: _phoneNumber.isNotEmpty 
                        ? const Color(0xFFDC2626)
                        : Colors.grey[300],
                    borderRadius: BorderRadius.circular(36),
                  ),
                  child: Icon(
                    Icons.call,
                    color: _phoneNumber.isNotEmpty ? Colors.white : Colors.grey[500],
                    size: 32,
                  ),
                ),
              ),
              
              // Clear button
              GestureDetector(
                onTap: () {
                  setState(() {
                    _phoneNumber = '';
                  });
                },
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: const Icon(
                    Icons.clear,
                    color: Colors.grey,
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDialButton(String number, String letters) {
    return GestureDetector(
      onTap: () => _addDigit(number),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(40),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              number,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w400,
                color: Color(0xFF1F2937),
              ),
            ),
            if (letters.isNotEmpty)
              Text(
                letters,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
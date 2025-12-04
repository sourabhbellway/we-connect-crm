class FollowUp {
  final int id;
  final int leadId;
  final DateTime dueDate;
  final String note;
  final String status; // PENDING, DONE, OVERDUE

  FollowUp({
    required this.id,
    required this.leadId,
    required this.dueDate,
    required this.note,
    this.status = 'PENDING',
  });

  factory FollowUp.fromJson(Map<String, dynamic> json) => FollowUp(
        id: json['id'] as int,
        leadId: json['leadId'] as int,
        dueDate: DateTime.parse(json['dueDate'] as String),
        note: json['note'] as String? ?? '',
        status: json['status'] as String? ?? 'PENDING',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'leadId': leadId,
        'dueDate': dueDate.toIso8601String(),
        'note': note,
        'status': status,
      };
}

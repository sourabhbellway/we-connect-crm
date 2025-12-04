class Quotation {
  final int id;
  final int leadId;
  final double amount;
  final String currency;
  final String status; // DRAFT, SENT, ACCEPTED, REJECTED
  final DateTime createdAt;

  Quotation({
    required this.id,
    required this.leadId,
    required this.amount,
    this.currency = 'USD',
    this.status = 'DRAFT',
    required this.createdAt,
  });

  factory Quotation.fromJson(Map<String, dynamic> json) => Quotation(
        id: json['id'] as int,
        leadId: json['leadId'] as int,
        amount: (json['amount'] as num?)?.toDouble() ?? 0,
        currency: json['currency'] as String? ?? 'USD',
        status: json['status'] as String? ?? 'DRAFT',
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'leadId': leadId,
        'amount': amount,
        'currency': currency,
        'status': status,
        'createdAt': createdAt.toIso8601String(),
      };
}

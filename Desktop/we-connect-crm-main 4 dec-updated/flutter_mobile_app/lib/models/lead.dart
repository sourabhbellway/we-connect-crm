class Lead {
  final int id;
  final String firstName;
  final String lastName;
  final String? email;
  final String phone;
  final String status;

  Lead({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.phone,
    this.email,
    this.status = 'NEW',
  });

  factory Lead.fromJson(Map<String, dynamic> json) => Lead(
        id: json['id'] as int,
        firstName: json['firstName'] as String? ?? '',
        lastName: json['lastName'] as String? ?? '',
        email: json['email'] as String?,
        phone: json['phone'] as String? ?? '',
        status: json['status'] as String? ?? 'NEW',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'phone': phone,
        'status': status,
      };
}

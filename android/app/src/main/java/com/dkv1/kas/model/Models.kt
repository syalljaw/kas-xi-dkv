package com.dkv1.kas.model

import com.google.firebase.firestore.DocumentId

// 1. Student Model
data class Student(
    @DocumentId val id: String = "",
    val name: String = "",
    val active: Boolean = true
)

// 2. Payment Model
data class Payment(
    @DocumentId val id: String = "",
    val studentId: String = "",
    val studentName: String = "",
    val amount: Double = 0.0,
    val monthPeriod: String = "", // e.g., "Juli 2026"
    val date: String = "", // YYYY-MM-DD
    val timestamp: Long = 0L
)

// 3. Expense Model
data class Expense(
    @DocumentId val id: String = "",
    val amount: Double = 0.0,
    val category: String = "", // ATK, Kegiatan, Donasi, Kebersihan, Konsumsi, Lainnya
    val reason: String = "",
    val date: String = "", // YYYY-MM-DD
    val monthPeriod: String = "", // e.g., "Juli 2026"
    val timestamp: Long = 0L
)

// 4. Settings Model
data class AppSettings(
    val className: String = "XI DKV 1",
    val logoUrl: String = "",
    val bannerUrl: String = "",
    val primaryColor: String = "#3F51B5", // hex color code
    val weeklyTarget: Double = 4000.0,
    val monthlyTarget: Double = 16000.0,
    val infoClass: String = "Kelas XI DKV 1 SMKN 1",
    val notificationEnabled: Boolean = true
)

// 5. Notification Model
data class NotificationLog(
    @DocumentId val id: String = "",
    val title: String = "",
    val body: String = "",
    val type: String = "", // PEMBAYARAN, PENGELUARAN, BULAN_BARU, SALDO_MENIPIS
    val timestamp: Long = 0L
)

// 6. Activity Log Model
data class ActivityLog(
    @DocumentId val id: String = "",
    val action: String = "",
    val details: String = "",
    val timestamp: Long = 0L
)

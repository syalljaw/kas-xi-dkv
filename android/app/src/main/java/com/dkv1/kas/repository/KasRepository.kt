package com.dkv1.kas.repository

import com.dkv1.kas.model.*
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

class KasRepository {
    private val db = FirebaseFirestore.getInstance()

    init {
        // Mengaktifkan Offline Cache untuk Firestore sesuai spesifikasi
        val settings = FirebaseFirestoreSettings.Builder()
            .setPersistenceEnabled(true)
            .build()
        db.firestoreSettings = settings
    }

    // --- STUDENTS ---
    suspend fun getStudents(): List<Student> {
        return db.collection("students")
            .orderBy("name", Query.Direction.ASCENDING)
            .get()
            .await()
            .toObjects(Student::class.java)
    }

    suspend fun addStudent(student: Student) {
        db.collection("students").add(student).await()
    }

    suspend fun updateStudent(student: Student) {
        db.collection("students").document(student.id).set(student).await()
    }

    suspend fun deleteStudent(studentId: String) {
        db.collection("students").document(studentId).delete().await()
    }

    // --- PAYMENTS ---
    suspend fun getPayments(monthPeriod: String): List<Payment> {
        return db.collection("payments")
            .whereEqualTo("monthPeriod", monthPeriod)
            .get()
            .await()
            .toObjects(Payment::class.java)
    }

    suspend fun addPayment(payment: Payment) {
        db.collection("payments").add(payment).await()
    }

    suspend fun updatePayment(payment: Payment) {
        db.collection("payments").document(payment.id).set(payment).await()
    }

    suspend fun deletePayment(paymentId: String) {
        db.collection("payments").document(paymentId).delete().await()
    }

    // --- EXPENSES ---
    suspend fun getExpenses(monthPeriod: String): List<Expense> {
        return db.collection("expenses")
            .whereEqualTo("monthPeriod", monthPeriod)
            .get()
            .await()
            .toObjects(Expense::class.java)
    }

    suspend fun addExpense(expense: Expense) {
        db.collection("expenses").add(expense).await()
    }

    suspend fun updateExpense(expense: Expense) {
        db.collection("expenses").document(expense.id).set(expense).await()
    }

    suspend fun deleteExpense(expenseId: String) {
        db.collection("expenses").document(expenseId).delete().await()
    }

    // --- SETTINGS ---
    suspend fun getSettings(): AppSettings? {
        val snapshot = db.collection("settings").document("global").get().await()
        return snapshot.toObject(AppSettings::class.java)
    }

    suspend fun updateSettings(settings: AppSettings) {
        db.collection("settings").document("global").set(settings).await()
    }
}

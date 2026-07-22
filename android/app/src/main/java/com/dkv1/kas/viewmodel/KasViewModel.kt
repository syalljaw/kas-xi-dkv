package com.dkv1.kas.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dkv1.kas.model.*
import com.dkv1.kas.repository.KasRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class KasViewModel : ViewModel() {
    private val repository = KasRepository()

    private val _students = MutableLiveData<List<Student>>()
    val students: LiveData<List<Student>> = _students

    private val _payments = MutableLiveData<List<Payment>>()
    val payments: LiveData<List<Payment>> = _payments

    private val _expenses = MutableLiveData<List<Expense>>()
    val expenses: LiveData<List<Expense>> = _expenses

    private val _settings = MutableLiveData<AppSettings>()
    val settings: LiveData<AppSettings> = _settings

    private val _selectedMonth = MutableLiveData<String>()
    val selectedMonth: LiveData<String> = _selectedMonth

    init {
        // Otomatis menetapkan periode bulan aktif (Asia/Jakarta)
        val sdf = SimpleDateFormat("MMMM yyyy", Locale("id", "ID"))
        sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        val currentPeriod = sdf.format(Date())
        _selectedMonth.value = currentPeriod

        loadAllData(currentPeriod)
    }

    fun loadAllData(period: String) {
        _selectedMonth.value = period
        viewModelScope.launch {
            try {
                _students.value = repository.getStudents()
                _payments.value = repository.getPayments(period)
                _expenses.value = repository.getExpenses(period)
                _settings.value = repository.getSettings() ?: AppSettings()
            } catch (e: Exception) {
                // Tangani error, misal log atau push offline cache
            }
        }
    }

    // --- STUDENT CRUD ---
    fun addStudent(name: String) {
        viewModelScope.launch {
            repository.addStudent(Student(name = name, active = true))
            loadAllData(_selectedMonth.value!!)
        }
    }

    fun updateStudent(student: Student) {
        viewModelScope.launch {
            repository.updateStudent(student)
            loadAllData(_selectedMonth.value!!)
        }
    }

    fun deleteStudent(id: String) {
        viewModelScope.launch {
            repository.deleteStudent(id)
            loadAllData(_selectedMonth.value!!)
        }
    }

    // --- PAYMENT CRUD ---
    fun addPayment(studentId: String, studentName: String, amount: Double) {
        val sdf = SimpleDateFormat("yyyy-MM-DD", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        val dateStr = sdf.format(Date())
        
        viewModelScope.launch {
            val payment = Payment(
                studentId = studentId,
                studentName = studentName,
                amount = amount,
                monthPeriod = _selectedMonth.value!!,
                date = dateStr,
                timestamp = System.currentTimeMillis()
            )
            repository.addPayment(payment)
            loadAllData(_selectedMonth.value!!)
        }
    }

    // --- EXPENSE CRUD ---
    fun addExpense(amount: Double, category: String, reason: String) {
        val sdf = SimpleDateFormat("yyyy-MM-DD", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        val dateStr = sdf.format(Date())

        viewModelScope.launch {
            val expense = Expense(
                amount = amount,
                category = category,
                reason = reason,
                date = dateStr,
                monthPeriod = _selectedMonth.value!!,
                timestamp = System.currentTimeMillis()
            )
            repository.addExpense(expense)
            loadAllData(_selectedMonth.value!!)
        }
    }
}

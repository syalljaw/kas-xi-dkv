package com.dkv1.kas.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.dkv1.kas.databinding.ItemStudentBinding
import com.dkv1.kas.model.Student
import com.dkv1.kas.model.Payment
import java.text.NumberFormat
import java.util.*

class StudentAdapter(
    private var students: List<Student>,
    private var payments: List<Payment>,
    private val monthlyTarget: Double,
    private val onItemClick: (Student) -> Unit
) : RecyclerView.Adapter<StudentAdapter.StudentViewHolder>() {

    inner class StudentViewHolder(val binding: ItemStudentBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StudentViewHolder {
        val binding = ItemStudentBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return StudentViewHolder(binding)
    }

    override fun onBindViewHolder(holder: StudentViewHolder, position: Int) {
        val student = students[position]
        
        // Hitung total bayar untuk siswa ini di bulan aktif
        val studentPayments = payments.filter { it.studentId == student.id }
        val totalPaid = studentPayments.sumOf { it.amount }
        val remaining = if (monthlyTarget - totalPaid > 0) monthlyTarget - totalPaid else 0.0
        val isLunas = totalPaid >= monthlyTarget

        val formatRupiah = NumberFormat.getCurrencyInstance(Locale("id", "ID"))

        holder.binding.textName.text = student.name
        holder.binding.textTotalPaid.text = "Total Bayar: ${formatRupiah.format(totalPaid)}"
        
        if (isLunas) {
            holder.binding.textStatus.text = "LUNAS"
            holder.binding.textStatus.setTextColor(holder.itemView.context.getColor(android.R.color.holo_green_dark))
            holder.binding.textRemaining.text = "Lunas Bulan Ini"
        } else {
            holder.binding.textStatus.text = "BELUM LUNAS"
            holder.binding.textStatus.setTextColor(holder.itemView.context.getColor(android.R.color.holo_red_dark))
            holder.binding.textRemaining.text = "Kurang: ${formatRupiah.format(remaining)}"
        }

        // Tanggal bayar terakhir
        val lastPayment = studentPayments.maxByOrNull { it.timestamp }
        holder.binding.textLastPayment.text = "Pembayaran Terakhir: ${lastPayment?.date ?: "-"}"

        holder.itemView.setOnClickListener { onItemClick(student) }
    }

    override fun getItemCount(): Int = students.size

    fun updateData(newStudents: List<Student>, newPayments: List<Payment>) {
        this.students = newStudents
        this.payments = newPayments
        notifyDataSetChanged()
    }
}

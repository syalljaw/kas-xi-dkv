package com.dkv1.kas

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.dkv1.kas.databinding.ActivityMainBinding
import com.google.firebase.auth.FirebaseAuth

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var appBarConfiguration: AppBarConfiguration
    private val auth = FirebaseAuth.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.appBarMain.toolbar)

        val navController = findNavController(R.id.nav_host_fragment_content_main)
        
        // Menghubungkan Drawer Layout dan Bottom Navigation
        appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.nav_visitor, R.id.nav_admin, R.id.nav_settings
            ), binding.drawerLayout
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        binding.navView.setupWithNavController(navController)
        binding.bottomNav?.setupWithNavController(navController)

        // Listen status login untuk Validasi Admin
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            if (user != null) {
                if (user.email != "syallprince@gmail.com") {
                    // Validasi Admin Gagal: Login Ditolak & Logout Otomatis
                    Toast.makeText(this, "Akses Ditolak! Hanya admin syallprince@gmail.com yang diperbolehkan.", Toast.LENGTH_LONG).show()
                    auth.signOut()
                    navController.navigate(R.id.nav_visitor)
                } else {
                    Toast.makeText(this, "Selamat datang Admin XI DKV 1!", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }
}

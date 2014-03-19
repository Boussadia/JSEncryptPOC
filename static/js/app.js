(function(window, $, JSEncrypt, undefined){
	$(document).ready(function(){
		// Premiére étape, génération du biclé	
		var KEY_SIZE = 2048; // en bits
		var PASSPHRASE = "ceci est une passphrase utilisée à des fins de tests.";
		var ID = "193269711503224930"; // Fake id

		var APP = {
			public_key: undefined,
			passphrase: PASSPHRASE,
			encrypted_private_key: undefined,
			private_key: undefined,

			generate_keys: function(done){
				var crypt = new JSEncrypt({default_key_size: KEY_SIZE});
				var that = this;
				//console.log("Key pair generation started.")
				var t0 = new Date();
				crypt.getKey(function(){
					//console.log("Key pair generation done in ", (new Date())-t0)/1000, 's';
					that.public_key = crypt.getPublicKey();
					that.private_key = crypt.getPrivateKey();
					if(done) done();
				})
			},
			encrypt_private_key: function(){
				if(this.private_key){
					this.encrypted_private_key = sjcl.encrypt(this.passphrase, this.private_key);
					return true;
				}else{
					//console.log("Private key not set.")
					return false;
				}
			},

			save_to_cookie: function(){
				if(this.encrypted_private_key){
					$.cookie(ID, this.encrypted_private_key, { expires: 7});
				}else{
					//console.log("Encrypted Private key not set.")
					return false;
				}
			},

			get_cookie: function(){
				try{
					var data = $.cookie(ID);
					this.encrypted_private_key = data;
					this.private_key = sjcl.decrypt(this.passphrase, this.encrypted_private_key);
					var cert = new JSEncrypt({log: true, default_key_size: KEY_SIZE});
					cert.setPrivateKey(this.private_key);
					return true;
				}catch(e){
					//console.log(e);
					return false;
				}
			},





			init: function(){
				var that = this;
				$("#passphrase").val(this.passphrase);
				$("#get_private_key").click(function(e){
					e.preventDefault();
					that.passphrase = $("#passphrase").val();
					var result = that.get_cookie();
					if(result){
						var private_key = that.private_key;
						$('#private_key').val(private_key);
					}else{
						alert('La passphrase n\'est pas correcte');
					}
				});

				$('#gen_keys').click(function(e){
					e.preventDefault();
					$('#gen_keys').attr("disabled", "disabled");
					$('#wait').show();
					var t = setInterval(function(){
						$('#wait').text($('#wait').text()+'.');
					}, 1000)
					that.generate_keys(function(){
						clearInterval(t);
						$('#gen_keys').removeAttr("disabled");  
						$('#wait').hide();
						alert('Le biclé a été sauvegardé!');
					});
				});

				$('#save_keys').click(function(e){
					e.preventDefault();
					that.passphrase = $("#passphrase").val();
					that.encrypt_private_key();
					that.save_to_cookie();
					alert('La clé privée a été sauvegardée')
				})
			}

		}

		// On attache l'application au contexte global pour la rendre publique
		window.APP = APP;
		APP.init();
	});

})(window, jQuery, JSEncrypt)
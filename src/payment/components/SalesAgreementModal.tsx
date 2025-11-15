import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SalesAgreementModalProps {
  visible: boolean;
  onClose: () => void;
}

const SalesAgreementModal: React.FC<SalesAgreementModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentLanguage } = useLanguage();

  const frenchText = `Conditions générales de vente

- MoroccoView appartient à une société Marocaine, Advanced AI, inscrite au Registre du Commerce de Casablanca, avec le numéro d'identifiant fiscal N 66236219 et dont le siège social est situé 26 avenue Mers sultan Apt 3 etage 1, Casablanca, Maroc.

- Advanced AI, opère sur le marché sous le nom de MoroccoView à travers le site Web, www.mview.ma

Champ d'application

- Ces conditions contractuelles s'appliqueront à toutes les commandes d'appareils effectuées via le site Web www.mview.ma

- Ces conditions sont les seules applicables aux achats effectués via le site Web et en aucun cas d'autres termes et / ou conditions ne s'appliqueront.

- En cochant la case "J'ai lu et j'accepte les Conditions Générales de Vente" du bon de commande, vous acceptez et vous engagez à respecter ces Conditions.

- MoroccoView se réserve le droit de modifier les présentes Conditions à tout moment et sans préavis. Toutefois, ces changements n'auront aucun effet sur les commandes passées avant la modification des Conditions du Site.

Enregistrement de l'utilisateur

- Pour passer une commande auprès de MoroccoView, vous devez vous inscrire en tant que client en indiquant votre compte de messagerie comme identifiant et mot de passe, ainsi que votre mots de passe. Vous confirmez que vous êtes une personne physique, majeure et capable de contracter et que vous passez la commande en tant que consommateur.

- Vous pouvez également vous inscrire sur le site l'application de MoroccoView en tant qu'utilisateur à tout moment sans passer de commande.

- Vous serez responsable de l'utilisation de votre mot de passe, c'est-à-dire de garder secret le mot de passe et les données de votre compte utilisateur. Le mot de passe est confidentiel et ne peut être partagé avec des tiers. Veuillez noter qu'un tiers connaissant votre mot de passe pourra passer des commandes en votre nom. Si vous oubliez vos données d'accès, vous pouvez demander à MoroccoView de vous envoyer un nouveau mot de passe.

- MoroccoView n'est pas responsable des dommages causés par une mauvaise utilisation ou la perte du mot de passe.

Véracité des informations

Toutes les informations fournies par l'Utilisateur via les Services doivent être véridiques. A ces fins, l'Utilisateur garantit l'authenticité de toutes les données qu'il communique à la suite du remplissage des formulaires nécessaires à la souscription des Services. De la même manière, il appartiendra à l'Utilisateur de tenir à jour en permanence toutes les informations fournies à MoroccoView afin qu'elles répondent, à tout moment, à la situation réelle de l'Utilisateur. Dans tous les cas, l'Utilisateur sera seul responsable des déclarations fausses ou inexactes faites et des dommages causés à MoroccoView ou à des tiers pour les informations fournies.

Images WEB

Les images du Web essaient de montrer le produit réel de la meilleure façon possible, pour cette raison, dans la plupart des modèles, il a des images à 360o. Cependant, il peut y avoir de petites variations de couleur ou de luminosité des produits, en raison de multiples facteurs environnementaux. Les images présentées n'ont aucune valeur contractuelle.

Formalisation de l'achat

Nous avons actuellement les options de paiement suivantes :

• Carte de crédit et de débit

Le processus d'achat se fait par les étapes suivantes :

- Le processus d'achat commence par la sélection du service proposé.

- Si vous le souhaitez et indiquez-le en cliquant sur l'option "Enregistrer", MoroccoView conservera, pendant une durée raisonnable, les données optiques que vous avez saisies lors du processus d'achat si vous vous étiez préalablement enregistré en tant que client.

- Par la suite, vous devez remplir le formulaire de commande en indiquant les informations demandées. Ces indications sont simplifiées dans le cas où vous vous êtes préalablement inscrit en tant que client. Le paiement peut être effectué uniquement par carte de crédit.

- Une fois que l'ordre de paiement a été confirmé par rapport à votre carte de crédit et que l'efficacité de cet ordre est vérifiée, MoroccoView vous enverra un e-mail confirmant votre achat.

- Nous vous recommandons d'imprimer et de conserver une copie papier de ces Conditions, de votre Confirmation d'achat.

Des prix

- Les prix seront ceux établis sur le site, sauf erreur manifeste.

- Les prix sont en Euro ou en dollars et incluent les taxes applicables.

- Étant donné que la vente est effectuée à des services au Maroc, la taxe applicable est la TVA Marocain de 20 %.

- MoroccoView peut modifier les prix à tout moment avant de recevoir la demande de votre commande.

- Les services seront fournis par MoroccoView une fois l'achat confirmé et le paiement effectué.

Général

- MoroccoView peut transférer, céder, grever, sous-traiter ou disposer du contrat, ou de l'un de ses droits ou obligations qui en découlent, à tout moment pendant la durée du contrat.

- La déclaration de nullité ou d'invalidité par un tribunal ou un arbitre de tout terme, condition ou paragraphe du présent contrat n'affectera pas la validité ou l'efficacité du reste du contrat.

- Ces Conditions seront régies et interprétées conformément à la loi Marocain. La résolution de toutes les questions litigieuses découlant de ces Conditions, ou liées à la violation, l'interprétation, la résolution ou la validité de toute disposition de ces Conditions, les parties, d'un commun accord, se soumettent à la juridiction et à la juridiction des Cours et Tribunaux marocains, renonçant expressément à toute autre juridiction qui pourrait leur être applicable.`;

  const englishText = `Terms and Conditions of Sale

- MoroccoView belongs to a Moroccan company, Advanced AI, registered in the Casablanca Trade Register, with tax identification number N 66236219 and whose registered office is located at 26 avenue Mers sultan Apt 3 floor 1, Casablanca, Morocco.

- Advanced AI operates in the market under the name MoroccoView through the website, www.mview.ma

Scope of Application

- These contractual terms will apply to all device orders placed through the website www.mview.ma

- These terms are the only ones applicable to purchases made through the website and in no case will other terms and/or conditions apply.

- By checking the box "I have read and accept the Terms and Conditions of Sale" on the order form, you accept and agree to comply with these Terms.

- MoroccoView reserves the right to modify these Terms at any time and without notice. However, these changes will have no effect on orders placed before the modification of the Site's Terms.

User Registration

- To place an order with MoroccoView, you must register as a customer by indicating your email account as username and password, as well as your password. You confirm that you are a natural person, of legal age and capable of contracting and that you are placing the order as a consumer.

- You can also register on the MoroccoView website application as a user at any time without placing an order.

- You will be responsible for the use of your password, that is, keeping the password and your user account data secret. The password is confidential and cannot be shared with third parties. Please note that a third party knowing your password will be able to place orders in your name. If you forget your access data, you can ask MoroccoView to send you a new password.

- MoroccoView is not responsible for damages caused by misuse or loss of the password.

Truthfulness of Information

All information provided by the User through the Services must be truthful. For this purpose, the User guarantees the authenticity of all data that he communicates following the completion of the forms necessary for the subscription of the Services. Similarly, it will be the User's responsibility to keep all information provided to MoroccoView up to date at all times so that it reflects, at all times, the User's actual situation. In all cases, the User will be solely responsible for false or inaccurate statements made and for damages caused to MoroccoView or to third parties for the information provided.

Web Images

The web images try to show the actual product in the best possible way, for this reason, in most models, it has 360o images. However, there may be slight variations in color or brightness of the products, due to multiple environmental factors. The images presented have no contractual value.

Purchase Formality

We currently have the following payment options:

• Credit and debit card

The purchase process is done through the following steps:

- The purchase process begins with the selection of the offered service.

- If you wish and indicate it by clicking on the "Save" option, MoroccoView will keep, for a reasonable period, the optical data you entered during the purchase process if you had previously registered as a customer.

- Subsequently, you must fill out the order form indicating the requested information. These indications are simplified in the case where you have previously registered as a customer. Payment can only be made by credit card.

- Once the payment order has been confirmed with respect to your credit card and the effectiveness of this order is verified, MoroccoView will send you an email confirming your purchase.

- We recommend that you print and keep a paper copy of these Terms, your Purchase Confirmation.

Prices

- Prices will be those established on the site, except for manifest error.

- Prices are in Euros or dollars and include applicable taxes.

- Since the sale is made for services in Morocco, the applicable tax is Moroccan VAT of 20%.

- MoroccoView may modify prices at any time before receiving your order request.

- Services will be provided by MoroccoView once the purchase is confirmed and payment is made.

General

- MoroccoView may transfer, assign, encumber, subcontract or dispose of the contract, or any of its rights or obligations arising therefrom, at any time during the term of the contract.

- The declaration of nullity or invalidity by a court or arbitrator of any term, condition or paragraph of this contract will not affect the validity or effectiveness of the rest of the contract.

- These Terms will be governed and interpreted in accordance with Moroccan law. The resolution of all contentious issues arising from these Terms, or related to the violation, interpretation, resolution or validity of any provision of these Terms, the parties, by mutual agreement, submit to the jurisdiction and jurisdiction of the Moroccan Courts and Tribunals, expressly waiving any other jurisdiction that might be applicable to them.`;

  // Fallback to English if language is not set
  const lang = currentLanguage || 'en';
  const agreementText = lang === 'fr' ? frenchText : englishText;
  const title = lang === 'fr' ? 'Conditions générales de vente' : 'Terms and Conditions of Sale';
  const acceptButton = lang === 'fr' ? "J'accepte" : 'I Accept';

  // Function to render formatted text with bold headers
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    // List of known section headers in both languages
    const frenchHeaders = [
      "Champ d'application",
      "Enregistrement de l'utilisateur",
      "Véracité des informations",
      "Images WEB",
      "Formalisation de l'achat",
      "Des prix",
      "Général"
    ];
    
    const englishHeaders = [
      "Scope of Application",
      "User Registration",
      "Truthfulness of Information",
      "Web Images",
      "Purchase Formality",
      "Prices",
      "General"
    ];
    
    const headers = lang === 'fr' ? frenchHeaders : englishHeaders;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();
      const prevLine = lines[i - 1]?.trim();
      
      // Check if this is a header
      const isHeader = line !== '' && 
                      !line.startsWith('-') && 
                      !line.startsWith('•') &&
                      headers.includes(line) &&
                      (prevLine === '' || prevLine === undefined || i === 0);
      
      if (isHeader) {
        // Render as header (bold)
        elements.push(
          <Text key={i} style={styles.sectionHeader}>
            {lines[i]}
            {'\n'}
          </Text>
        );
      } else if (line !== '') {
        // Render as regular text
        elements.push(
          <Text key={i} style={styles.agreementText}>
            {lines[i]}
            {'\n'}
          </Text>
        );
      } else {
        // Empty line
        elements.push(
          <Text key={i} style={styles.agreementText}>
            {'\n'}
          </Text>
        );
      }
    }
    
    return <Text>{elements}</Text>;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {renderFormattedText(agreementText)}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={onClose}
            >
              <Text style={styles.acceptButtonText}>{acceptButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF7F7',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxWidth: 450,
    height: SCREEN_HEIGHT * 0.75,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#CE1126',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CE1126',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#CE1126',
    flex: 1,
    textAlign: 'left',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  agreementText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#CE1126',
    lineHeight: 22,
    textAlign: 'left',
    marginTop: 12,
    marginBottom: 6,
  },
  buttonContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexShrink: 0,
  },
  acceptButton: {
    backgroundColor: '#CE1126',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CE1126',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default SalesAgreementModal;


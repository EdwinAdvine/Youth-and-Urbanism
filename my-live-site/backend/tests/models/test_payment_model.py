"""
Payment Model Tests

Tests for the Payment SQLAlchemy models (Transaction, Wallet, PaymentMethod):
- Transaction instantiation and status lifecycle
- Wallet instantiation, credit, and debit operations
- PaymentMethod instantiation and management methods
- Table name verification for all models
- Default values
- Property helpers
- String representation

Coverage target: 70%+
"""

import uuid
import pytest
from datetime import datetime
from decimal import Decimal

from app.models.payment import Transaction, Wallet, PaymentMethod
from tests.factories import UserFactory


# -- Transaction Model Tests --------------------------------------------------


@pytest.mark.unit
class TestTransactionInstantiation:
    """Test Transaction model instantiation."""

    async def test_transaction_instantiation_with_required_fields(self, db_session):
        """Test creating a transaction with required fields."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("1500.00"),
            gateway="mpesa",
            transaction_reference="TXN-REF-001",
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.id is not None
        assert txn.user_id == user.id
        assert txn.amount == Decimal("1500.00")
        assert txn.gateway == "mpesa"
        assert txn.transaction_reference == "TXN-REF-001"

    async def test_transaction_with_all_fields(self, db_session):
        """Test creating a transaction with all fields populated."""
        user = await UserFactory.create(db_session, role="parent")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("5000.00"),
            currency="USD",
            gateway="stripe",
            status="completed",
            transaction_reference="TXN-REF-002",
            transaction_metadata={
                "stripe_payment_intent": "pi_test_123",
                "description": "Course purchase",
            },
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.currency == "USD"
        assert txn.status == "completed"
        assert txn.transaction_metadata["stripe_payment_intent"] == "pi_test_123"

    async def test_transaction_mpesa_gateway(self, db_session):
        """Test creating an M-Pesa transaction."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("1000.00"),
            gateway="mpesa",
            transaction_reference="MPESA-001",
            transaction_metadata={"phone": "+254712345678"},
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.gateway == "mpesa"

    async def test_transaction_paypal_gateway(self, db_session):
        """Test creating a PayPal transaction."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("25.00"),
            currency="USD",
            gateway="paypal",
            transaction_reference="PAYPAL-001",
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.gateway == "paypal"

    async def test_transaction_stripe_gateway(self, db_session):
        """Test creating a Stripe transaction."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("3500.00"),
            gateway="stripe",
            transaction_reference="STRIPE-001",
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.gateway == "stripe"


@pytest.mark.unit
class TestTransactionDefaultValues:
    """Test default values for Transaction model fields."""

    async def test_default_currency_is_kes(self, db_session):
        """Test that currency defaults to KES."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("500.00"),
            gateway="mpesa",
            transaction_reference="TXN-DEF-001",
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.currency == "KES"

    async def test_default_status_is_pending(self, db_session):
        """Test that status defaults to 'pending'."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("750.00"),
            gateway="mpesa",
            transaction_reference="TXN-DEF-002",
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.status == "pending"

    async def test_timestamps_auto_set(self, db_session):
        """Test that created_at and updated_at are automatically set."""
        user = await UserFactory.create(db_session, role="student")

        txn = Transaction(
            user_id=user.id,
            amount=Decimal("100.00"),
            gateway="mpesa",
            transaction_reference="TXN-DEF-003",
        )

        db_session.add(txn)
        await db_session.commit()
        await db_session.refresh(txn)

        assert txn.created_at is not None
        assert txn.updated_at is not None
        assert isinstance(txn.created_at, datetime)


@pytest.mark.unit
class TestTransactionTableName:
    """Test Transaction model table name."""

    def test_table_name(self):
        """Test that the table name is 'transactions'."""
        assert Transaction.__tablename__ == "transactions"


@pytest.mark.unit
class TestTransactionGatewayProperties:
    """Test Transaction gateway property helpers."""

    def test_is_mpesa(self):
        """Test is_mpesa returns True for M-Pesa transactions."""
        txn = Transaction(gateway="mpesa", amount=Decimal("100.00"),
                          transaction_reference="T1")
        assert txn.is_mpesa is True
        assert txn.is_paypal is False
        assert txn.is_stripe is False

    def test_is_paypal(self):
        """Test is_paypal returns True for PayPal transactions."""
        txn = Transaction(gateway="paypal", amount=Decimal("100.00"),
                          transaction_reference="T2")
        assert txn.is_paypal is True
        assert txn.is_mpesa is False
        assert txn.is_stripe is False

    def test_is_stripe(self):
        """Test is_stripe returns True for Stripe transactions."""
        txn = Transaction(gateway="stripe", amount=Decimal("100.00"),
                          transaction_reference="T3")
        assert txn.is_stripe is True
        assert txn.is_mpesa is False
        assert txn.is_paypal is False


@pytest.mark.unit
class TestTransactionStatusProperties:
    """Test Transaction status property helpers."""

    def test_is_pending(self):
        """Test is_pending returns True for pending transactions."""
        txn = Transaction(status="pending", gateway="mpesa",
                          amount=Decimal("100.00"), transaction_reference="T4")
        assert txn.is_pending is True

    def test_is_completed(self):
        """Test is_completed returns True for completed transactions."""
        txn = Transaction(status="completed", gateway="mpesa",
                          amount=Decimal("100.00"), transaction_reference="T5")
        assert txn.is_completed is True

    def test_is_failed(self):
        """Test is_failed returns True for failed transactions."""
        txn = Transaction(status="failed", gateway="mpesa",
                          amount=Decimal("100.00"), transaction_reference="T6")
        assert txn.is_failed is True

    def test_is_refunded(self):
        """Test is_refunded returns True for refunded transactions."""
        txn = Transaction(status="refunded", gateway="mpesa",
                          amount=Decimal("100.00"), transaction_reference="T7")
        assert txn.is_refunded is True


@pytest.mark.unit
class TestTransactionRepresentation:
    """Test Transaction model string representation."""

    def test_repr_method(self):
        """Test __repr__ returns useful string."""
        txn = Transaction(
            gateway="mpesa",
            amount=Decimal("2500.00"),
            currency="KES",
            status="pending",
            transaction_reference="T-REPR",
        )

        repr_str = repr(txn)

        assert "Transaction" in repr_str
        assert "mpesa" in repr_str
        assert "2500" in repr_str


# -- Wallet Model Tests -------------------------------------------------------


@pytest.mark.unit
class TestWalletInstantiation:
    """Test Wallet model instantiation."""

    async def test_wallet_instantiation_with_required_fields(self, db_session):
        """Test creating a wallet with required fields."""
        user = await UserFactory.create(db_session, role="student")

        wallet = Wallet(user_id=user.id)

        db_session.add(wallet)
        await db_session.commit()
        await db_session.refresh(wallet)

        assert wallet.id is not None
        assert wallet.user_id == user.id

    async def test_wallet_with_initial_balance(self, db_session):
        """Test creating a wallet with an initial balance."""
        user = await UserFactory.create(db_session, role="parent")

        wallet = Wallet(
            user_id=user.id,
            balance=Decimal("5000.00"),
            currency="KES",
        )

        db_session.add(wallet)
        await db_session.commit()
        await db_session.refresh(wallet)

        assert wallet.balance == Decimal("5000.00")
        assert wallet.currency == "KES"


@pytest.mark.unit
class TestWalletDefaultValues:
    """Test default values for Wallet model fields."""

    async def test_default_balance_zero(self, db_session):
        """Test that balance defaults to 0.00."""
        user = await UserFactory.create(db_session, role="student")

        wallet = Wallet(user_id=user.id)

        db_session.add(wallet)
        await db_session.commit()
        await db_session.refresh(wallet)

        assert wallet.balance == Decimal("0.00") or wallet.balance == 0

    async def test_default_currency_kes(self, db_session):
        """Test that currency defaults to KES."""
        user = await UserFactory.create(db_session, role="student")

        wallet = Wallet(user_id=user.id)

        db_session.add(wallet)
        await db_session.commit()
        await db_session.refresh(wallet)

        assert wallet.currency == "KES"

    async def test_timestamps_auto_set(self, db_session):
        """Test that created_at and updated_at are automatically set."""
        user = await UserFactory.create(db_session, role="student")

        wallet = Wallet(user_id=user.id)

        db_session.add(wallet)
        await db_session.commit()
        await db_session.refresh(wallet)

        assert wallet.created_at is not None
        assert wallet.updated_at is not None


@pytest.mark.unit
class TestWalletTableName:
    """Test Wallet model table name."""

    def test_table_name(self):
        """Test that the table name is 'wallets'."""
        assert Wallet.__tablename__ == "wallets"


@pytest.mark.unit
class TestWalletCreditDebit:
    """Test Wallet credit and debit operations."""

    def test_credit_adds_to_balance(self):
        """Test credit method increases balance."""
        wallet = Wallet(balance=Decimal("1000.00"), currency="KES")

        wallet.credit(Decimal("500.00"))

        assert wallet.balance == Decimal("1500.00")

    def test_credit_updates_timestamp(self):
        """Test credit method updates updated_at."""
        wallet = Wallet(
            balance=Decimal("1000.00"),
            currency="KES",
            updated_at=datetime(2025, 1, 1),
        )

        wallet.credit(Decimal("100.00"))

        assert wallet.updated_at > datetime(2025, 1, 1)

    def test_credit_rejects_zero_amount(self):
        """Test credit raises ValueError for zero amount."""
        wallet = Wallet(balance=Decimal("1000.00"))

        with pytest.raises(ValueError, match="Credit amount must be positive"):
            wallet.credit(Decimal("0.00"))

    def test_credit_rejects_negative_amount(self):
        """Test credit raises ValueError for negative amount."""
        wallet = Wallet(balance=Decimal("1000.00"))

        with pytest.raises(ValueError, match="Credit amount must be positive"):
            wallet.credit(Decimal("-100.00"))

    def test_debit_subtracts_from_balance(self):
        """Test debit method decreases balance."""
        wallet = Wallet(balance=Decimal("2000.00"), currency="KES")

        wallet.debit(Decimal("750.00"))

        assert wallet.balance == Decimal("1250.00")

    def test_debit_updates_timestamp(self):
        """Test debit method updates updated_at."""
        wallet = Wallet(
            balance=Decimal("1000.00"),
            currency="KES",
            updated_at=datetime(2025, 1, 1),
        )

        wallet.debit(Decimal("100.00"))

        assert wallet.updated_at > datetime(2025, 1, 1)

    def test_debit_rejects_zero_amount(self):
        """Test debit raises ValueError for zero amount."""
        wallet = Wallet(balance=Decimal("1000.00"))

        with pytest.raises(ValueError, match="Debit amount must be positive"):
            wallet.debit(Decimal("0.00"))

    def test_debit_rejects_negative_amount(self):
        """Test debit raises ValueError for negative amount."""
        wallet = Wallet(balance=Decimal("1000.00"))

        with pytest.raises(ValueError, match="Debit amount must be positive"):
            wallet.debit(Decimal("-50.00"))

    def test_debit_rejects_insufficient_balance(self):
        """Test debit raises ValueError when amount exceeds balance."""
        wallet = Wallet(balance=Decimal("500.00"))

        with pytest.raises(ValueError, match="Insufficient balance"):
            wallet.debit(Decimal("600.00"))

    def test_debit_exact_balance(self):
        """Test debit allows deducting the exact balance amount."""
        wallet = Wallet(balance=Decimal("1000.00"))

        wallet.debit(Decimal("1000.00"))

        assert wallet.balance == Decimal("0.00")


@pytest.mark.unit
class TestWalletHasBalance:
    """Test Wallet has_balance property."""

    def test_has_balance_true_when_positive(self):
        """Test has_balance returns True when balance is positive."""
        wallet = Wallet(balance=Decimal("100.00"))
        assert wallet.has_balance is True

    def test_has_balance_false_when_zero(self):
        """Test has_balance returns False when balance is zero."""
        wallet = Wallet(balance=Decimal("0.00"))
        assert wallet.has_balance is False


@pytest.mark.unit
class TestWalletRepresentation:
    """Test Wallet model string representation."""

    def test_repr_method(self):
        """Test __repr__ returns useful string."""
        wallet = Wallet(balance=Decimal("3500.00"), currency="KES")

        repr_str = repr(wallet)

        assert "Wallet" in repr_str
        assert "3500" in repr_str


# -- PaymentMethod Model Tests ------------------------------------------------


@pytest.mark.unit
class TestPaymentMethodInstantiation:
    """Test PaymentMethod model instantiation."""

    async def test_payment_method_instantiation(self, db_session):
        """Test creating a payment method with required fields."""
        user = await UserFactory.create(db_session, role="parent")

        pm = PaymentMethod(
            user_id=user.id,
            gateway="mpesa",
            method_type="phone",
            details={"last4": "5678", "phone": "+254712345678"},
        )

        db_session.add(pm)
        await db_session.commit()
        await db_session.refresh(pm)

        assert pm.id is not None
        assert pm.user_id == user.id
        assert pm.gateway == "mpesa"
        assert pm.method_type == "phone"
        assert pm.details["last4"] == "5678"

    async def test_stripe_payment_method(self, db_session):
        """Test creating a Stripe card payment method."""
        user = await UserFactory.create(db_session, role="student")

        pm = PaymentMethod(
            user_id=user.id,
            gateway="stripe",
            method_type="card",
            details={"last4": "4242", "brand": "Visa", "exp_month": 12, "exp_year": 2027},
        )

        db_session.add(pm)
        await db_session.commit()
        await db_session.refresh(pm)

        assert pm.gateway == "stripe"
        assert pm.method_type == "card"
        assert pm.details["brand"] == "Visa"

    async def test_paypal_payment_method(self, db_session):
        """Test creating a PayPal payment method."""
        user = await UserFactory.create(db_session, role="student")

        pm = PaymentMethod(
            user_id=user.id,
            gateway="paypal",
            method_type="paypal_account",
            details={"email": "user@example.com"},
        )

        db_session.add(pm)
        await db_session.commit()
        await db_session.refresh(pm)

        assert pm.gateway == "paypal"
        assert pm.method_type == "paypal_account"


@pytest.mark.unit
class TestPaymentMethodDefaultValues:
    """Test default values for PaymentMethod model fields."""

    async def test_default_is_default_false(self, db_session):
        """Test that is_default defaults to False."""
        user = await UserFactory.create(db_session, role="student")

        pm = PaymentMethod(
            user_id=user.id,
            gateway="mpesa",
            method_type="phone",
        )

        db_session.add(pm)
        await db_session.commit()
        await db_session.refresh(pm)

        assert pm.is_default is False

    async def test_default_is_active_true(self, db_session):
        """Test that is_active defaults to True."""
        user = await UserFactory.create(db_session, role="student")

        pm = PaymentMethod(
            user_id=user.id,
            gateway="mpesa",
            method_type="phone",
        )

        db_session.add(pm)
        await db_session.commit()
        await db_session.refresh(pm)

        assert pm.is_active is True


@pytest.mark.unit
class TestPaymentMethodTableName:
    """Test PaymentMethod model table name."""

    def test_table_name(self):
        """Test that the table name is 'payment_methods'."""
        assert PaymentMethod.__tablename__ == "payment_methods"


@pytest.mark.unit
class TestPaymentMethodGatewayProperties:
    """Test PaymentMethod gateway property helpers."""

    def test_is_mpesa(self):
        """Test is_mpesa returns True for M-Pesa methods."""
        pm = PaymentMethod(gateway="mpesa", method_type="phone")
        assert pm.is_mpesa is True
        assert pm.is_paypal is False
        assert pm.is_stripe is False

    def test_is_paypal(self):
        """Test is_paypal returns True for PayPal methods."""
        pm = PaymentMethod(gateway="paypal", method_type="paypal_account")
        assert pm.is_paypal is True

    def test_is_stripe(self):
        """Test is_stripe returns True for Stripe methods."""
        pm = PaymentMethod(gateway="stripe", method_type="card")
        assert pm.is_stripe is True


@pytest.mark.unit
class TestPaymentMethodTypeProperties:
    """Test PaymentMethod method type property helpers."""

    def test_is_phone(self):
        """Test is_phone returns True for phone-based methods."""
        pm = PaymentMethod(gateway="mpesa", method_type="phone")
        assert pm.is_phone is True

    def test_is_card(self):
        """Test is_card returns True for card-based methods."""
        pm = PaymentMethod(gateway="stripe", method_type="card")
        assert pm.is_card is True

    def test_is_paypal_account(self):
        """Test is_paypal_account returns True for PayPal account methods."""
        pm = PaymentMethod(gateway="paypal", method_type="paypal_account")
        assert pm.is_paypal_account is True


@pytest.mark.unit
class TestPaymentMethodManagement:
    """Test PaymentMethod management methods."""

    def test_activate(self):
        """Test activate sets is_active to True."""
        pm = PaymentMethod(
            gateway="mpesa", method_type="phone", is_active=False,
        )

        pm.activate()

        assert pm.is_active is True

    def test_deactivate(self):
        """Test deactivate sets is_active to False and is_default to False."""
        pm = PaymentMethod(
            gateway="mpesa", method_type="phone", is_active=True, is_default=True,
        )

        pm.deactivate()

        assert pm.is_active is False
        assert pm.is_default is False

    def test_set_as_default(self):
        """Test set_as_default sets is_default to True and is_active to True."""
        pm = PaymentMethod(
            gateway="mpesa", method_type="phone", is_active=False, is_default=False,
        )

        pm.set_as_default()

        assert pm.is_default is True
        assert pm.is_active is True


@pytest.mark.unit
class TestPaymentMethodDisplayInfo:
    """Test PaymentMethod get_display_info method."""

    def test_display_info_mpesa(self):
        """Test display info for M-Pesa method."""
        pm = PaymentMethod(
            gateway="mpesa", method_type="phone",
            details={"last4": "5678"},
        )

        display = pm.get_display_info()
        assert "M-Pesa" in display
        assert "5678" in display

    def test_display_info_stripe_card(self):
        """Test display info for Stripe card method."""
        pm = PaymentMethod(
            gateway="stripe", method_type="card",
            details={"last4": "4242", "brand": "Visa"},
        )

        display = pm.get_display_info()
        assert "Visa" in display
        assert "4242" in display

    def test_display_info_paypal(self):
        """Test display info for PayPal method."""
        pm = PaymentMethod(
            gateway="paypal", method_type="paypal_account",
            details={"email": "john.doe@example.com"},
        )

        display = pm.get_display_info()
        assert "PayPal" in display
        # Email should be masked
        assert "jo" in display
        assert "@example.com" in display

    def test_display_info_no_details(self):
        """Test display info when details is None."""
        pm = PaymentMethod(
            gateway="mpesa", method_type="phone", details=None,
        )

        display = pm.get_display_info()
        assert "MPESA" in display
        assert "No details" in display

    def test_display_info_missing_last4(self):
        """Test display info when last4 is missing from details."""
        pm = PaymentMethod(
            gateway="stripe", method_type="card",
            details={"brand": "Mastercard"},
        )

        display = pm.get_display_info()
        assert "STRIPE" in display


@pytest.mark.unit
class TestPaymentMethodRepresentation:
    """Test PaymentMethod model string representation."""

    def test_repr_method(self):
        """Test __repr__ returns useful string."""
        pm = PaymentMethod(
            gateway="mpesa",
            method_type="phone",
            is_default=True,
            is_active=True,
        )

        repr_str = repr(pm)

        assert "PaymentMethod" in repr_str
        assert "mpesa" in repr_str
        assert "phone" in repr_str

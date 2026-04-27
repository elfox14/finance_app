const Expense         = require('../models/Expense');
const Income          = require('../models/Income');
const Loan            = require('../models/Loan');
const LoanInstallment = require('../models/LoanInstallment');
const LoanPayment     = require('../models/LoanPayment');
const Card            = require('../models/Card');
const CardTransaction = require('../models/CardTransaction');
const CardPayment     = require('../models/CardPayment');
const CardInstallment = require('../models/CardInstallment');
const CardStatement   = require('../models/CardStatement');
const CardAction      = require('../models/CardAction');
const Group           = require('../models/Group');
const GroupPayment    = require('../models/GroupPayment');
const Certificate     = require('../models/Certificate');
const Budget          = require('../models/Budget');
const Category        = require('../models/Category');
const Account         = require('../models/Account');
const { PeerDebt, PeerDebtPayment } = require('../models/PeerDebt');

// @desc    Delete ALL user data permanently (Nuclear Reset)
// @route   DELETE /api/auth/nuke
// @access  Private
exports.deleteAllData = async (req, res) => {
    try {
        const userId = req.user._id;

        // التحقق من نص التأكيد
        const { confirmText } = req.body;
        if (confirmText !== 'احذف كل البيانات') {
            return res.status(400).json({ 
                message: 'نص التأكيد غير صحيح. اكتب "احذف كل البيانات" للمتابعة.' 
            });
        }

        // حذف جميع البيانات المرتبطة بالمستخدم دفعة واحدة
        await Promise.all([
            Expense.deleteMany({ userId }),
            Income.deleteMany({ userId }),
            Loan.deleteMany({ userId }),
            LoanInstallment.deleteMany({ userId }),
            LoanPayment.deleteMany({ userId }),
            Card.deleteMany({ userId }),
            CardTransaction.deleteMany({ userId }),
            CardPayment.deleteMany({ userId }),
            CardInstallment.deleteMany({ userId }),
            CardStatement.deleteMany({ userId }),
            CardAction.deleteMany({ userId }),
            Group.deleteMany({ userId }),
            GroupPayment.deleteMany({ userId }),
            Certificate.deleteMany({ userId }),
            Budget.deleteMany({ userId }),
            Category.deleteMany({ userId }),
            Account.deleteMany({ userId }),
            PeerDebt.deleteMany({ userId }),
            PeerDebtPayment.deleteMany({ userId }),
        ]);

        console.log(`🗑️ Nuclear Reset: All data deleted for user ${userId}`);

        res.json({ 
            success: true,
            message: 'تم مسح جميع البيانات بنجاح. حسابك نظيف تماماً الآن.' 
        });

    } catch (err) {
        console.error('🔥 Nuclear Reset Error:', err);
        res.status(500).json({ message: 'حدث خطأ أثناء مسح البيانات: ' + err.message });
    }
};
